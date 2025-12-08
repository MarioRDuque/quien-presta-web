window.initRangeSliders = function () {
    const PEN = n => `S/. ${Number(n).toLocaleString('es-PE')}`;
    const monthsLabel = m => `${m} ${m === 1 ? 'Mes' : 'Meses'}`;

    var $price = $("#range_price");
    var $date = $("#range_date");

    let priceInst, dateInst;

    function renderSelection() {
        if (!priceInst || !dateInst) return;
        const amount = priceInst.result.from;
        const term = dateInst.result.from;
        $("#val-amount").text(PEN(amount));
        $("#val-term").text(monthsLabel(term));
    }

    $price.ionRangeSlider({
        grid: true,
        min: 100,
        max: 10000,
        from: 5000,
        step: 100,
        prefix: "S/. ",
        prettify: num => Number(num).toLocaleString('es-PE'),
        onStart: renderSelection,
        onChange: data => {
            renderSelection();
            document.dispatchEvent(new CustomEvent('precioChanged', { detail: data.from }));
        },
        onFinish: data => {
            renderSelection();
            document.dispatchEvent(new CustomEvent('precioChanged', { detail: data.from }));
        }
    });
    priceInst = $price.data("ionRangeSlider");

    $date.ionRangeSlider({
        grid: true,
        min: 12,
        max: 36,
        from_min: 12,
        from: 18,
        step: 6,
        hide_min_max: true,
        postfix: " Meses",
        onStart: renderSelection,
        onChange: data => {
            renderSelection();
            document.dispatchEvent(new CustomEvent('tiempoChanged', { detail: data.from }));
        },
        onFinish: data => {
            renderSelection();
            document.dispatchEvent(new CustomEvent('tiempoChanged', { detail: data.from }));
        }
    });
    dateInst = $date.data("ionRangeSlider");

    renderSelection();
};
