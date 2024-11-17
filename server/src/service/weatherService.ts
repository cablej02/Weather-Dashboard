import dotenv from 'dotenv';
dotenv.config();

interface Coordinates{
    lat: number;
    lon: number;    
}

// // TODO: Define a class for the Weather object
// class Weather{
//     constructor(){

//     }
// }

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
            console.log(locationDatas)//TODO: not sure what this is supposed to be returning
            console.log(locationDatas.data)
            return locationDatas.data[0];
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
        console.log(locationData) //TODO: remove this if all is good
        return this.destructureLocationData(locationData);
    }

    // private buildWeatherQuery(coordinates: Coordinates): string {
    //     return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`
    // }

    // // TODO: Create fetchWeatherData method
    // private async fetchWeatherData(coordinates: Coordinates) {

    // }

    // // TODO: Build parseCurrentWeather method
    // private parseCurrentWeather(response: any) {}

    // // TODO: Complete buildForecastArray method
    // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}

    // TODO: Complete getWeatherForCity method
    async getWeatherForCity(city: string) {
        this.cityName = city;

        const coord: Coordinates = await this.fetchAndDestructureLocationData()
        console.log(coord);
        return coord;

    }
}

export default new WeatherService();
