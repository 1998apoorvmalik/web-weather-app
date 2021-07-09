const express = require('express');
const https = require('https');
const app = express();

// use urlencode to parse the request body
app.use(express.urlencoded({
    extended: false
}));

// serve your css as static
app.use(express.static(__dirname));

app.listen(3000, function () {
    console.log("Started a local server (for Weather App) on port 3000.");
});

app.get("/", function (_, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/weather", function (req, res) {
    const apiKey = '866ffa713790c9fbd11df13e54de963b';
    const cityName = req.query.cityName;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
    https.get(url, function (response) {
        if (response.statusCode != 200) {
            res.status(400).send("Not found");
            return;
        }
        response.on("data", function (data) {
            const weatherData = JSON.parse(data);
            const temperature = weatherData.main.temp;
            const weatherDescription = weatherData.weather[0].description;
            const iconId = weatherData.weather[0].icon;
            const imageUrl = `http://openweathermap.org/img/wn/${iconId}@2x.png`
            res.send({
                'cityName': weatherData.name,
                'temperature': temperature,
                'description': weatherDescription,
                'imageUrl': imageUrl,
            });
        });
    });
});