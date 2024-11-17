import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
    try{
        console.log(req.params)//TODO delete this
        const cityName = req.params.city;

        const weather = await WeatherService.getWeatherForCity(cityName)
        console.log(weather)
        const sanitizedCityName = cityName[0].toLowerCase() + cityName.slice(1).toLowerCase()
        await HistoryService.addCity(sanitizedCityName)
        res.json(weather)

    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
});

router.get('/history', async (_req: Request, res: Response) => {
    try {
        const savedCities = await HistoryService.getCities();
        res.json(savedCities);
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
});

router.delete('/history/:id', async (req: Request, res: Response) => {
    try {
        if (!req.params.id) {
          res.status(400).json({ msg: 'State id is required' });
        }
        await HistoryService.removeCity(req.params.id);
        res.json({ success: 'City successfully removed from search history' });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
});

export default router;
