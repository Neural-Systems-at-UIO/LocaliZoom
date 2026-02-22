var voldata;
function initvol(buffer, next) {
//    console.log(location);
    let start = Date.now();
//    var img=document.createElement("img");
//    img.onload=function(){
//        var canvas=document.createElement("canvas");
//        canvas.width=img.width;
//        canvas.height=img.height;
//        var ctx=canvas.getContext("2d");
//        ctx.drawImage(img,0,0);
//        voldata=ctx.getImageData(0,0,canvas.width,canvas.height).data;
//        next();
//    };
//    img.src=location;
//    var xhr=new XMLHttpRequest();
//    xhr.open("GET",location);
//    xhr.responseType="arraybuffer";
//    xhr.onload=function(){
    let data = new Uint8Array(buffer);
    console.log("Download", data.length, Date.now() - start);
    data = inflate(data);
    console.log("Deflate", data.length, Date.now() - start);
    data = derle(data, atlas.encoding);
    console.log("Decode", data.length, Date.now() - start);
    voldata = data;
    next();
//    };
//    xhr.send();
}

function dataslice(ouv) {
    var width = Math.round(Math.sqrt(ouv.ux * ouv.ux + ouv.uy * ouv.uy + ouv.uz * ouv.uz));
    var height = Math.round(Math.sqrt(ouv.vx * ouv.vx + ouv.vy * ouv.vy + ouv.vz * ouv.vz));
    var data = new Uint16Array(width * height);
    var xdim = atlas.xdim;
    var ydim = atlas.ydim;
    var zdim = atlas.zdim;
    var zslice = xdim * ydim;
    var i = 0;
    for (var y = 0; y < height; y++) {
        var hx = ouv.ox + ouv.vx * y / height;
        var hy = ouv.oy + ouv.vy * y / height;
        var hz = ouv.oz + ouv.vz * y / height;
        for (var x = 0; x < width; x++, i++) {
            var lx = Math.round(hx + ouv.ux * x / width);
            var ly = Math.round(hy + ouv.uy * x / width);
            var lz = Math.round(hz + ouv.uz * x / width);
            if ((lx >= 0) && (lx < xdim) && (ly >= 0) && (ly < ydim) && (lz >= 0) && (lz < zdim))
                data[i] = voldata[lx + ly * xdim + lz * zslice];
        }
    }
    return {data: data, width: width, height: height};
}

function slice(ouv) {
    var data = dataslice(ouv);
    var canvas = document.createElement("canvas");
    var w = canvas.width = data.width;
    var h = canvas.height = data.height;
    var ctx = canvas.getContext("2d");
    var slice = ctx.createImageData(w, h);
    var slicedata = slice.data;
    var d = data.data;
    for (var i = 0, j = 0; i < d.length; i++) {
        var lbl = atlas.labels[d[i]];
        slicedata[j++] = lbl.r;
        slicedata[j++] = lbl.g;
        slicedata[j++] = lbl.b;
        slicedata[j++] = 255;
    }
    ctx.putImageData(slice, 0, 0);
//    return canvas;
    var ret = document.createElement("canvas");
    ret.width = 128;
    ret.height = 128 * h / w;
    ret.getContext("2d").drawImage(canvas, 0, 0, ret.width, ret.height);
    return ret;
}

function iconset(ouv, options) {
    const org = dataslice(ouv);
    const orgd = org.data;
    const orgw = org.width;
    const orgh = org.height;
    const w = options.hasOwnProperty("width") ? options.width : Math.floor(options.height * orgw / orgh);
    const h = options.hasOwnProperty("height") ? options.height : Math.floor(options.width * orgh / orgw);
    const scaled = new Uint16Array(w * h);
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
            scaled[x + y * w] = orgd[Math.floor(x * orgw / w) + orgw * Math.floor(y * orgh / h)];
    const opaquedata = new ImageData(w, h);
    const pd = opaquedata.data;
    const overlaydata = new ImageData(w, h);
    const vd = overlaydata.data;
    const outlinedata = new ImageData(w, h);
    const ud = outlinedata.data;
    let i = 0;
    let j = 0;
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const d = scaled[i];
            if (d === 0)
                pd[j + 3] = 255;
            else {
                const l = atlas.labels[d];
                pd[j] = vd[j] = l.r;
                pd[j + 1] = vd[j + 1] = l.g;
                pd[j + 2] = vd[j + 2] = l.b;
                pd[j + 3] = vd[j + 3] = 255;
            }
            if ((x > 0 && scaled[i - 1] !== d) ||
                    (x < w - 1 && scaled[i + 1] !== d) ||
                    (y > 0 && scaled[i - w] !== d) ||
                    (y < h - 1 && scaled[i + w] !== d))
                ud[j + 3] = 255;
            i++;
            j += 4;
        }
    const opaque = document.createElement("canvas");
    const overlay = document.createElement("canvas");
    const outline = document.createElement("canvas");
    opaque.width = overlay.width = outline.width = w;
    opaque.height = overlay.height = outline.height = h;
    opaque.getContext("2d").putImageData(opaquedata, 0, 0);
    overlay.getContext("2d").putImageData(overlaydata, 0, 0);
    outline.getContext("2d").putImageData(outlinedata, 0, 0);
    return {opaque, overlay, outline, outlinedata};
}
