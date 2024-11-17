import dotenv from 'dotenv';
dotenv.config();

interface Coordinates{
    lat: number;
    lon: number;    
}

class Weather{
    city: string;
    date: string;
    icon: string;
    iconDescription: string;
    tempF: string;
    windSpeed: number;
    humidity: number;

    constructor(city:string, date:string , icon:string, iconDescription: string, tempF: string, windSpeed: number, humidity:number){
        this.city = city;
        this.date = date;
        this.icon = icon;
        this.iconDescription = iconDescription;
        this.tempF = tempF;
        this.windSpeed = windSpeed;
        this.humidity = humidity;
    }
}

// TODO: Complete the WeatherService class
class WeatherService {
    private baseURL?: string;
    private apiKey?: string;
    private cityName?: string;
    constructor() {
        this.baseURL = process.env.API_BASE_URL || '';
        this.apiKey = process.env.API_KEY || '';
        //TODO: set city name to something default?  can we get current location somehow?
    }

    private async fetchLocationData(query: string) {
        try{
            const response = await fetch(query)
            const locationDatas = await response.json();
            return locationDatas[0];
        }catch(err) {
            console.log('Error:', err)
            return err;
        }
    }

    private destructureLocationData(locationData: Coordinates): Coordinates {
        const coord: Coordinates = {
            lat: locationData.lat,
            lon: locationData.lon
        }

        return coord;
    }

    private buildGeocodeQuery(): string {
        return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`
    }

    private async fetchAndDestructureLocationData() {
        const locationData = await this.fetchLocationData(this.buildGeocodeQuery())
        return this.destructureLocationData(locationData);
    }

    private buildWeatherQuery(coordinates: Coordinates): string {
        return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`
    }

    private async fetchWeatherData(query: string) {
        try{
            const response = await fetch(query)
            const weatherData = await response.json();
            return weatherData;
        }catch(err) {
            console.log('Error:', err)
            return err;
        }
    }

    // TODO: Build parseCurrentWeather method
    private parseCurrentWeather(response: any) {
        const currentWeather = new Weather(
            response.city.name,
            response.list[0].dt_txt,
            response.list[0].weather[0].icon,
            response.list[0].weather[0].description,
            response.list[0].main.temp,
            response.list[0].wind.speed,
            response.list[0].main.humidity
        )

        return currentWeather;
    }

    // // TODO: Complete buildForecastArray method
    private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
        const forecast = weatherData.map((data: any) => {
            return new Weather(
                currentWeather.city,
                data.dt_txt,
                data.weather[0].icon,
                data.weather[0].description,
                data.main.temp,
                data.wind.speed,
                data.main.humidity
            )
        })

        return forecast;

    }

    // TODO: Complete getWeatherForCity method
    async getWeatherForCity(city: string) {
        this.cityName = city;
        try{
            const coord: Coordinates = await this.fetchAndDestructureLocationData()
            const weatherData = await this.fetchWeatherData(this.buildWeatherQuery(coord))
            const currentWeather = this.parseCurrentWeather(weatherData)
            const forecast = this.buildForecastArray(currentWeather, weatherData.list)

            return forecast;
        }catch(err){
            console.log('Error:', err)
            return err;
        }
    }
}

export default new WeatherService();
