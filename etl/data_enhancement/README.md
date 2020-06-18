## Requirements

To install the required node.js packages for the ranking scripts use following command in this directory:

> npm install

This will install every need dependency (see package.json)

Also the python requirements have to installed by using following command in the etl directory:

> pip3 install -r requirements.txt

## Execution

First execute the script_artworks_rank.js script

> node --max-old-space-size=4096 ../data_enhancement/script_artworks_rank.js

The execution order of the other ranking script doesn't matter

> node --max-old-space-size=4096 ../data_enhancement/script_genres_rank.js

> node --max-old-space-size=4096 ../data_enhancement/script_artist_rank.js

> node --max-old-space-size=4096 ../data_enhancement/script_locations_rank.js

> node --max-old-space-size=4096 ../data_enhancement/script_materials_rank.js

> node --max-old-space-size=4096 ../data_enhancement/script_movements_rank.js

> node --max-old-space-size=4096 ../data_enhancement/script_objects_rank.js

The next step is merging all files into one:

> node --max-old-space-size=4096 ../data_enhancement/merge_art_data.js

Next estimate start and end for all movements

> python3 ../data_manipulation/estimate_movement_period.py

After this step add youtube videos

> python3 ../data_enhancement/add_youtube_videos.py

At the end split the art_ontology.json into language files

> python3 ../data_enhancement/split_languages.py

All intermediate files (\*.json) have to be located in /crawler_output/intermediate_files/json otherwise there will be errors.

Further information can be found [here](https://github.com/hochschule-darmstadt/openartbrowser/wiki/System-architecture#data-transformation-ranking-and-merging-intermediate-json-files)
