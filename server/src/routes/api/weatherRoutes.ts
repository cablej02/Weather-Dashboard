import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

router.post('/', async (req: Request, res: Response) => {
    try{
        const cityName = req.body.cityName;
        const weather = await WeatherService.getWeatherForCity(cityName)
        await HistoryService.addCity(cityName)
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
          res.status(400).json({ msg: 'City id is required' });
        }
        await HistoryService.removeCity(req.params.id);
        res.json({ success: 'City successfully removed from search history' });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
});

export default router;
