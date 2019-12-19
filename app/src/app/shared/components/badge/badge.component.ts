import { Component, ViewEncapsulation, Input, OnInit } from "@angular/core";
import { Entity } from "../../models/models";

@Component({
  selector: "app-badge",
  templateUrl: "./badge.component.html",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./badge.component.scss"]
})
export class BadgeComponent implements OnInit {
  @Input() entity: Entity;

  icon: string;
  label: string;
  redirectUrl: string;
  tooltip: string;

  tooltipBreakLimit: number = 150;

  ngOnInit() {
    this.icon = icons[this.entity.type] || "fa-user";
    this.redirectUrl = `/${this.entity.type}/${this.entity.id}` || "/";
    this.label = this.entity.label || "";

    // display the abstract or description; break after defined char limit
    this.tooltip = this.entity.abstract || this.entity.description || null;
    if (this.tooltip && this.tooltip.length >= this.tooltipBreakLimit)
      this.tooltip =
        this.tooltip.substr(
          0,
          this.tooltip.indexOf(".", this.tooltipBreakLimit)
        ) + " [...]";
  }
}

enum icons {
  artist = "fa-user",
  artwork = "fa-image",
  movement = "fa-wind",
  location = "fa-archway",
  motif = "fa-image",
  genre = "fa-tag",
  material = "fa-scroll"
}