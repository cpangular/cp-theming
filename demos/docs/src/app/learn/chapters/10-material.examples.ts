// The live example of Learn chapter 10. Like the examples of the Components
// gallery it is an Angular template in src/examples/, rendered as the
// `templateUrl` of a component that adds layout and nothing else, so the page
// shows what runs. It renders the gallery's own Buttons example.
import { Component } from '@angular/core';
import { GalleryButtons } from '../../packages/pages/components/gallery.components';

@Component({
  selector: 'cpa-learn-material-example',
  imports: [GalleryButtons],
  templateUrl: '../../../examples/learn/10-material/example.ng.html',
  styleUrl: '../../packages/pages/components/gallery-layout.scss',
})
export class LearnMaterialExample {}
