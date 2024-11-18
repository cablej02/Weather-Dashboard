//import { error } from 'node:console';
import fs from 'node:fs/promises'
import { v4 as uuidv4 } from 'uuid';

class City{
    name: string;
    id: string;
    constructor(name: string, id: string){
        this.name = name;
        this.id = id;
    }
}

class HistoryService {
    private async read() {
        return await fs.readFile('db/searchHistory.json', {
            flag: 'a+', // file is created if it does not exist
            encoding: 'utf-8'
        })
    }

    private async write(cities: City[]) {
        return await fs.writeFile('db/searchHistory.json', JSON.stringify(cities,null,'\t'))
    }

    async getCities() {
        return await this.read().then(cities => {
            let parsedCities: City[];
            
            //if can't concat, return empty array
            try{
                parsedCities = [].concat(JSON.parse(cities))
            } catch(err) {
                parsedCities = [];
            }

            return parsedCities;
        })
    }

    async addCity(city: string) {
        if(!city) throw new Error('city cannot be blank');

        const sanitizedCity: string = city
            .split(' ')
            .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        const newCity = new City(sanitizedCity, uuidv4());
        return await this.getCities()
            .then(cities => {
                if(cities.find(index => index.name.toLowerCase() === city.toLowerCase())) return cities
                return [...cities,newCity];
            })
            .then(cities => this.write(cities))
            .then(() => newCity);
    }

    async removeCity(id: string) {
        if(!id) throw new Error('id cannot be blank')

        await this.getCities()
            .then(cities => {
                return cities.filter(city => city.id !== id)
            })
            .then(filteredCities => this.write(filteredCities));
    }
}

export default new HistoryService();
