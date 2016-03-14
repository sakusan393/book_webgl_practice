/**
 * Created by 393 on 2016/03/13.
 */
ImageLoader = {
    length: 0,
    images: {},
    load: function (pathArray, callback) {
        this.length = pathArray.length;
        for (var i = 0; i < this.length; i++) {
            var img = new Image();
            var counter = 0;
            img.onload = function () {
                counter++;
                var id = this.src.split("/")[this.src.split("/").length - 1].split(".")[0];
                ImageLoader.images[id] = this;
                if (counter >= ImageLoader.length) callback();
            };
            img.src = pathArray[i];

        }
    }
};
