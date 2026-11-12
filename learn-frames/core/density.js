// ─────────────────────────────────────────────────────────────────────────────
// Relative density — enableRelativeDensity()
//
// Watches for [themeDensityLower] and [themeDensityHigher] attributes and
// resolves them relative to the nearest ancestor's effective --density-scale.
//
// Attribute syntax:
//   [themeDensity="N"]        — absolute density (handled entirely by CSS)
//   [themeDensityLower="N"]   — N steps more compact than the inherited scale
//   [themeDensityHigher="N"]  — N steps more spacious than the inherited scale
//
// Resolution: reads the *parent element's* computed --density-scale so that
// nested relative adjustments chain correctly. Then writes:
//   - an inline --density-scale style so descendants inherit the right value
//   - a [themeDensity] attribute so the CSS selector emits the correct
//     --space--* vars (clamped to the supported range)
// ─────────────────────────────────────────────────────────────────────────────
const ATTR_LOWER = 'themeDensityLower';
const ATTR_HIGHER = 'themeDensityHigher';
const DENSITY_MIN = -5;
const DENSITY_MAX = 5;
function resolveElement(el) {
    const lowerAttr = el.getAttribute(ATTR_LOWER);
    const higherAttr = el.getAttribute(ATTR_HIGHER);
    if (lowerAttr === null && higherAttr === null)
        return;
    // Read the parent's effective density — not the element's own, to avoid
    // reading back the inline style we previously wrote on this element.
    const parent = el.parentElement ?? el;
    const parentScale = parseFloat(getComputedStyle(parent).getPropertyValue('--density-scale').trim()) || 0;
    const delta = lowerAttr !== null ? -(parseInt(lowerAttr, 10) || 0) : parseInt(higherAttr, 10) || 0;
    const resolved = Math.max(DENSITY_MIN, Math.min(DENSITY_MAX, parentScale + delta));
    // Write inline --density-scale so descendants inherit the resolved value.
    el.style.setProperty('--density-scale', String(resolved));
    // Set [themeDensity] so the CSS scope selectors emit the right --space--* vars.
    // Use Math.round to clamp to integer (CSS selectors are exact-match strings).
    el.setAttribute('themeDensity', String(Math.round(resolved)));
}
/**
 * Call once at app startup to activate relative density attributes.
 *
 * @param root  Element to observe (default: document.documentElement)
 * @returns     A cleanup function that disconnects the MutationObserver.
 */
export function enableRelativeDensity(root = document.documentElement) {
    // Resolve any elements already in the DOM.
    root.querySelectorAll(`[${ATTR_LOWER}],[${ATTR_HIGHER}]`).forEach(resolveElement);
    // Watch for attribute changes or newly added elements.
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes') {
                resolveElement(mutation.target);
            }
            else if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement))
                        return;
                    if (node.hasAttribute(ATTR_LOWER) || node.hasAttribute(ATTR_HIGHER)) {
                        resolveElement(node);
                    }
                    // Also check descendants of the added subtree.
                    node
                        .querySelectorAll(`[${ATTR_LOWER}],[${ATTR_HIGHER}]`)
                        .forEach(resolveElement);
                });
            }
        }
    });
    observer.observe(root, {
        subtree: true,
        attributes: true,
        attributeFilter: [ATTR_LOWER, ATTR_HIGHER],
        childList: true,
    });
    return () => observer.disconnect();
}
//# sourceMappingURL=density.js.map