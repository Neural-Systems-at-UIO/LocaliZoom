const loaders = {
    SeriesLoader: async series_id => fetch(series_id).then(response => response.json()),
    DZILoader: () => {},
    TileLoader: () => {},
    AtlasLoader: async atlas_id => fetch(atlas_id + ".json").then(response => response.json()),
    AtlasVolumeLoader: async atlas_id => fetch(atlas_id + ".pack").then(response => response.arrayBuffer())
};

async function transformSeries(series) {
    /*
     * convert extensions to .tif except when directed otherwise:
     */
    if (args.pyramids !== "buckets/img-eff39c41-6eaa-4d3f-a91f-ef936e793606"
            && args.pyramids !== "buckets/d-d12e41db-78ec-46ac-b3e7-8f22b219f6fb"
            && !args.nontiff) {
        for (const slice of series.slices) {
            const filename = slice.filename;
            const pos = filename.lastIndexOf(".");
            if (pos >= 0) {
                slice.filename = filename.substring(0, pos) + ".tif";
            }
        }
    }
    /*
     * argument-specific loaders
     */
    if (args.pyramids.startsWith("buckets/")) {
        /*
         * pyramids in collab bucket
         */
        loaders.DZILoader = section_id =>
            fetch(`https://data-proxy.ebrains.eu/api/v1/${args.pyramids}/${section_id}/${section_id.substring(0, section_id.lastIndexOf("."))}.dzi`).then(response => response.text());
        loaders.TileLoader = async (section_id, level, x, y, format) => {
            const img = document.createElement("img");
            await new Promise(resolve => {
                img.onload = resolve;
                img.src = `https://data-proxy.ebrains.eu/api/v1/${args.pyramids}/${section_id}/${section_id.substring(0, section_id.lastIndexOf("."))}_files/${level}/${x}_${y}.${format}`;
            });
            return img;
        };
    } else {
        /*
         * pyramids in legacy image service container
         */
        loaders.DZILoader = section_id =>
            fetch(`https://object.cscs.ch/v1/AUTH_08c08f9f119744cbbf77e216988da3eb/${args.pyramids}/${section_id}/${section_id.substring(0, section_id.lastIndexOf("."))}.dzi`).then(response => response.text());
        loaders.TileLoader = async (section_id, level, x, y, format) => {
            const img = document.createElement("img");
            await new Promise(resolve => {
                img.onload = resolve;
                img.src = `https://object.cscs.ch/v1/AUTH_08c08f9f119744cbbf77e216988da3eb/${args.pyramids}/${section_id}/${section_id.substring(0, section_id.lastIndexOf("."))}_files/${level}/${x}_${y}.${format}`;
            });
            return img;
        };
    }
}
