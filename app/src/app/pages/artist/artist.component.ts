import { Component, OnInit, OnDestroy } from '@angular/core';
import { Artist, Artwork, EntityType, Movement } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { shuffle } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss']
})
export class ArtistComponent implements OnInit, OnDestroy {
  /* TODO:REVIEW
    Similiarities in every page-Component:
    - variables: ngUnsubscribe, collapse, sliderItems, dataService, route
    - ngOnDestroy, calculateCollapseState, ngOnInit

    1. Use Inheritance (Root-Page-Component) or Composition
    2. Inject entity instead of artist
  */

  /** The entity this page is about */
  artist: Artist = null;
  /** Related artworks */
  sliderItems: Artwork[] = [];
  /** Change collapse icon; true if more infos are folded in */
  collapse = true;
  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** Toggle bool for displaying either timeline or artworks carousel component */
  showTimelineNotArtworks = true;

  /** a video was found */
  videoExists = false;
  /* List of unique Entities (Movements) with Videos */
  uniqueEntityVideos: any;
  /* List of unique Videolinks */
  uniqueVideosLinks: string[];

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    this.route.params.subscribe(() => {
      this.videoExists = false;
    });
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async params => {
      this.uniqueEntityVideos = {};
      this.uniqueVideosLinks = [];
      const artistId = params.get('artistId');
      /** Use data service to fetch entity from database */
      this.artist = await this.dataService.findById<Artist>(artistId, EntityType.ARTIST);
      if (this.artist.videos) {
        this.uniqueEntityVideos[this.artist.id] = this.artist;
        this.uniqueVideosLinks.push(this.getVideoUrl(this.artist));
      }

      /** load slider items */
      this.dataService.findArtworksByType(EntityType.ARTIST, [this.artist.id])
        .then(artworks => (this.sliderItems = shuffle(artworks)));
      /** dereference movements  */
      this.dataService.findMultipleById(this.artist.movements as any, EntityType.MOVEMENT)
        .then(movements => (this.artist.movements = movements));
      /** dereference influenced_bys */
      this.dataService.findMultipleById(this.artist.influenced_by as any, EntityType.ARTIST)
        .then(influences => (this.artist.influenced_by = influences));

      /* Count meta data to show more on load */
      this.aggregatePictureMovementsToArtist();
      this.calculateCollapseState();
    });
  }


  getVideoUrl(entity) {
    return Array.isArray(entity.videos) ? entity.videos[0] : entity.videos;
  }

  /*
    Iterates over the movements and adds all videos to uniqueEntityVideos.
    Only Videos whose id and link are not in uniqueEntityVideos & uniqueVideosLinks will be added.
  */
  addMovementVideos() {
    for ( const movement of this.artist.movements) {
      if (!this.uniqueEntityVideos[movement.id] && movement.videos && !this.uniqueVideosLinks.includes(this.getVideoUrl(movement))) {
        this.uniqueEntityVideos[movement.id] = movement;
        this.uniqueVideosLinks.push(this.getVideoUrl(movement));
      }
    }
  }
  /**
   * Get all movements from the artworks of an artist and add them to the artist movements.
   * Since the first query only gives back the movement id and not the complete movement object,
   * it needs to be queried again to get the corresponding movement object.
   * Since the movements are added as arrays of arrays the deletion of duplicate movements is done at the end.
   */
  private async aggregatePictureMovementsToArtist() {
    const allMovements: Partial<Movement>[] = [];
    this.dataService.findArtworksByType(EntityType.ARTIST, [this.artist.id]).then(artworks => {
      artworks.forEach(artwork => {
        artwork.movements.forEach(movement => {
          if (movement !== '') {
            allMovements.push(movement);
            this.addMovementVideos();
          }
        });
      });
      this.dataService.findMultipleById(allMovements as any, EntityType.MOVEMENT).then(movements => {
        movements.forEach(movement => {
          this.artist.movements.push(movement);
        });
        this.artist.movements = _.uniqWith(this.artist.movements, _.isEqual);
        this.addMovementVideos();
      });
    });
  }

  /** calculates the size of meta data item section
   * every attribute: +3
   * if attribute is array and size > 3 -> + arraylength
   */
  private calculateCollapseState() {
    let metaNumber = 0;
    if (this.artist.abstract.length > 400) {
      metaNumber += 10;
    } else if (this.artist.abstract.length) {
      metaNumber += 3;
    }
    if (this.artist.gender) {
      metaNumber += 3;
    }
    if (!_.isEmpty(this.artist.influenced_by)) {
      metaNumber += this.artist.influenced_by.length > 3 ? this.artist.influenced_by.length : 3;
    }
    if (!_.isEmpty(this.artist.movements)) {
      metaNumber += this.artist.movements.length > 3 ? this.artist.movements.length : 3;
    }
    if (!_.isEmpty(this.artist.citizenship)) {
      metaNumber += 3;
    }
    if (metaNumber < 10) {
      this.collapse = false;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

  toggleComponent() {
    this.showTimelineNotArtworks = !this.showTimelineNotArtworks;
  }

  videoFound(event) {
    this.videoExists = this.videoExists ? true : event;
  }
}
