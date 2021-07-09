var anyPendingRequests = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function onWeatherRequestFailure() {
    $('#search-query-form').after("<div id='error-message'><span style='color: red'>[Error]</span> Failed to fetch weather data.</div>");
    await sleep(2000);
    $("#error-message").remove();
    anyPendingRequests = false;
}

function onWeatherRequestSuccess(data) {
    $('#card-container').prepend($('#loader').after(`<div class="card p-3 mt-4 me-md-4 text-start"><h5>${data.cityName}\
    </h5><div class="temperature">${parseInt(data.temperature)}</div><img src=${data.imageUrl}>\
    <h6 class="text-uppercase">${data.description}</h6></div>`));
    anyPendingRequests = false;
}

function addButtonAnimation() {
    $('button').on('mouseenter', function (event) {
        $(event.target).css('opacity', 0.75);
    }).on('mouseleave', function (event) {
        $(event.target).css('opacity', 1);
    });
}

function fetchDataDirectly(cityName) {
    const apiKey = '866ffa713790c9fbd11df13e54de963b';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`

    $.get(url).done(function (weatherData) {
        const temperature = weatherData.main.temp;
        const weatherDescription = weatherData.weather[0].description;
        const iconId = weatherData.weather[0].icon;
        const imageUrl = `http://openweathermap.org/img/wn/${iconId}@2x.png`
        onWeatherRequestSuccess({
            'cityName': weatherData.name,
            'temperature': temperature,
            'description': weatherDescription,
            'imageUrl': imageUrl,
        });

    }).fail(function () {
        onWeatherRequestFailure();
    })
}

$('#loader').hide();
addButtonAnimation();

jQuery.ajaxSetup({
    beforeSend: function () {
        $('#loader').show();

        const target = $('#submit');
        target.off('mouseenter, mouseleave');
        target.css('opacity', 0.75);
    },
    complete: function () {
        $('#loader').hide();

        $('#submit').css('opacity', 1);
        addButtonAnimation();
    },
});

$('#submit').on('click', function () {
    if (!anyPendingRequests) {
        anyPendingRequests = true;
        const cityName = $('#city-name').val();
        $('#city-name').val("");
        if (cityName.length > 0) {
            $.get('/weather', {
                'cityName': cityName
            }).done(function (res) {
                onWeatherRequestSuccess(res);
            }).fail(function () {
                fetchDataDirectly(cityName);
            });
        } else {
            anyPendingRequests = false;
            $('#submit').css('opacity', 1);
        }
    }
});

$('#reset').on('click', async function () {
    const target = $('#reset');
    target.off('mouseenter, mouseleave');
    target.css('opacity', 0.75);
    $(".card").remove();
    await sleep(100);
    $(target).css('opacity', '1');
    addButtonAnimation();
});