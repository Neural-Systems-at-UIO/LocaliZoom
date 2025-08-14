const loaders = {
    SeriesLoader: async series_id => fetch(series_id).then(response => response.json()),
    DZILoader: () => {},
    TileLoader: () => {},
    AtlasLoader: async atlas_id => fetch("https://data-proxy.ebrains.eu/api/v1/buckets/quint-atlas-binaries/LZ-flatpacks/" + atlas_id + ".json").then(response => response.json()),
    AtlasVolumeLoader: async atlas_id => fetch("https://data-proxy.ebrains.eu/api/v1/buckets/quint-atlas-binaries/LZ-flatpacks/" + atlas_id + ".pack").then(response => response.arrayBuffer())
};

async function transformSeries(series) {
    if(series.bucket) {
        series.slices = series.sections.map(section => ({
            filename: section.filename,
            nr: section.snr,
            width: section.width,
            height: section.height,
            anchoring: section.ouv,
            markers: section.markers
        }));
        series.dziproot = `https://data-proxy.ebrains.eu/api/v1/buckets/${series.bucket}/.nesysWorkflowFiles/zippedPyramids`;
    }
    if(args.dzip) {
        series.dziproot = args.dzip.match(/(.*zippedPyramids).*/)[1];
        const prefix = args.dzip.match(/.*zippedPyramids\/(.*)\/.*$/)[1];
        for(let section of series.slices) {
            section.filename = prefix + "/" + section.filename.split(".")[0] + ".dzip";
        }
    }

    /*
     * transform certain parts of filenames (like _thumbnail), comma separated
     */
    if (args.transform) {
        const parts = args.transform.split(",").map(part => part.split("="));
        for (const slice of series.slices)
            for (const part of parts)
                slice.filename = slice.filename.replaceAll(part[0], part.length > 1 ? part[1] : "");
    }

    if (args.dziproot) {
        series.dziproot = args.dziproot;
    }
    if(series.dziproot) {
        const dzipmap = new Map;
        loaders.DZILoader = async section_id => {
            if(!dzipmap.has(section_id)) {
                dzipmap.set(section_id, await netunzip(`${series.dziproot}/${section_id}`));
            }
            const zip = dzipmap.get(section_id);
            return new TextDecoder().decode(await zip.get(zip.entries.get(section_id.match(/(?:.*\/)?(.*)p/)[1])));
        };
        loaders.TileLoader = async (section_id, level, x, y, format) => {
            const zip = dzipmap.get(section_id);
            const data = await zip.get(zip.entries.get(`${section_id.match(/(?:.*\/)?(.*).dzip/)[1]}_files/${level}/${x}_${y}.${format}`));
            const url = URL.createObjectURL(new Blob([data], {type: `image/${format}`}));
            const img = document.createElement("img");
            await new Promise(resolve => {
                img.onload = () => {
                    URL.revokeObjectURL(url);
                    resolve();
                };
                img.src = url;
            });
            return img;
        };
        return;
    }
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
//            fetch(`https://object.cscs.ch/v1/AUTH_08c08f9f119744cbbf77e216988da3eb/${args.pyramids}/${section_id}/${section_id.substring(0, section_id.lastIndexOf("."))}.dzi`).then(response => response.text());
            fetch(`https://data-proxy.ebrains.eu/api/v1/buckets/p08c08-${args.pyramids}/${section_id}/${section_id.substring(0, section_id.lastIndexOf("."))}.dzi`).then(response => response.text());
        loaders.TileLoader = async (section_id, level, x, y, format) => {
            const img = document.createElement("img");
            await new Promise(resolve => {
                img.onload = resolve;
//                img.src = `https://object.cscs.ch/v1/AUTH_08c08f9f119744cbbf77e216988da3eb/${args.pyramids}/${section_id}/${section_id.substring(0, section_id.lastIndexOf("."))}_files/${level}/${x}_${y}.${format}`;
                img.src = `https://data-proxy.ebrains.eu/api/v1/buckets/p08c08-${args.pyramids}/${section_id}/${section_id.substring(0, section_id.lastIndexOf("."))}_files/${level}/${x}_${y}.${format}`;
            });
            return img;
        };
    }
}
