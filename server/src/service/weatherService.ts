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

    private async fetchForecastData(coordinates: Coordinates) {
        try{
            const response = await fetch(`${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`)
            const weatherData = await response.json();
            return weatherData;
        }catch(err) {
            console.log('Error:', err)
            return err;
        }
    }

    private async fetchCurrentWeatherData(coordinates: Coordinates) {
        try{
            const response = await fetch(`${this.baseURL}/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`)
            const currentWeatherData = await response.json();
            return currentWeatherData;
        }catch(err) {
            console.log('Error:', err)
            return err;
        }
    }

    private parseCurrentWeather(response: any) {
        const localTime = new Date((response.dt + response.timezone) * 1000);

        //format the date to MM/DD/YYYY
        const year = localTime.getUTCFullYear();
        const month = String(localTime.getUTCMonth() + 1).padStart(2, "0");
        const day = String(localTime.getUTCDate()).padStart(2, "0");
        const formattedDate = `${month}/${day}/${year}`;

        const currentWeather = new Weather(
            response.name,
            formattedDate,
            response.weather[0].icon,
            response.weather[0].description,
            response.main.temp,
            response.wind.speed,
            response.main.humidity
        )

        return currentWeather;
    }

    private buildForecastArray(currentWeather: Weather, weatherData: any[], timezone: number) {
        const forecast: Weather[] = []
        forecast.push(currentWeather)

        const forecastData: { [key: string]: any } = {}; // Object to hold aggregated data
        weatherData.forEach((data) => {
            const localTime = new Date((data.dt + timezone) * 1000);

            //format the date to MM/DD/YYYY
            const year = localTime.getUTCFullYear();
            const month = String(localTime.getUTCMonth() + 1).padStart(2, "0");
            const day = String(localTime.getUTCDate()).padStart(2, "0");
            const date = `${month}/${day}/${year}`;

            if (!forecastData[date]) {
                forecastData[date] = {
                    date: date,
                    icon: data.weather[0].icon,
                    iconDescription: data.weather[0].description,
                    tempF: data.main.temp,
                    windSpeed: data.wind.speed,
                    humidity: data.main.humidity
                }
            }else{
                // update the forecast data if time is not after 12:00
                if(localTime.getHours() < 13){
                    forecastData[date].icon = data.weather[0].icon;
                    forecastData[date].iconDescription = data.weather[0].description;

                    forecastData[date].tempF = data.main.temp;
                    forecastData[date].windSpeed = data.wind.speed;
                    forecastData[date].humidity = data.main.humidity;
                }
            }
        });

        // add the forecast data to the forecast array
        for(const key in forecastData){
            if(key === currentWeather.date) continue;
            forecast.push(new Weather(
                currentWeather.city,
                forecastData[key].date,
                forecastData[key].icon,
                forecastData[key].iconDescription,
                forecastData[key].tempF,
                forecastData[key].windSpeed,
                forecastData[key].humidity
            ))
        }

        return forecast;
    }

    async getWeatherForCity(city: string) {
        this.cityName = city;
        try{
            const coord: Coordinates = await this.fetchAndDestructureLocationData()

            const currentWeatherData = await this.fetchCurrentWeatherData(coord)
            const forecastData = await this.fetchForecastData(coord)

            const currentWeather: Weather = this.parseCurrentWeather(currentWeatherData)
            const forecast: Weather[] = this.buildForecastArray(currentWeather, forecastData.list, forecastData.city.timezone)

            return forecast;
        }catch(err){
            console.log('Error:', err)
            return err;
        }
    }
}

export default new WeatherService();
