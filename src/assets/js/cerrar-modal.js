window.cerrarModal = function () {
var Webflow = Webflow || [];
Webflow.push(function () {
    var l = $('#flowbaseSlider .w-slider-arrow-left');
    var r = $('#flowbaseSlider .w-slider-arrow-right');
    var button = $('.open-modal-button');
    $(button)
        .on('click', function () {
            $('body').addClass('modal-open');
        });
    $('.close-modal-button').on('click', function () {
        $('body').removeClass('modal-open');
    });
    $('#flowbaseSlider')
        .on('click', '.slider-left', function () {
            l.trigger('tap');
        })
        .on('click', '.slider-right', function () {
            r.trigger('tap');
            $('body').addClass('modal-open');
        });
});
};