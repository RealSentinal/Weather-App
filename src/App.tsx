import axios from 'axios';
import weatherCode from './lib/weathercode.json';
import { useState, useEffect } from 'react';
import { List, Search } from 'lucide-react';

async function getWeather() {
  const userIp: string = await axios.get("https://api.ipify.org?format=json")
    .then((response) => {
      return response.data.ip;
    });

  const locationData: any = await axios.get(`https://api.ip2location.io/?key=596D4DE0A6152EB125588EAB7096DA66&ip=${userIp}`)
    .then((response) => {
      return {
        lat: response.data.latitude,
        lon: response.data.longitude
      };
    });

  const weatherData: any = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${locationData.lat}&longitude=${locationData.lon}&hourly=temperature_2m,weather_code`)
    .then((response) => {
      console.log(response.data);
      return response.data;
    });

  const time = new Date().getHours();

  return {
    temperature: weatherData.hourly.temperature_2m.slice(time, time + 12),
    time: weatherData.hourly.time.slice(time, time + 12),
    weatherCode: weatherData.hourly.weather_code
  };
}

function App() {
  const [temperature, setTemperature] = useState<number[]>([]);
  const [time, setTime] = useState<string[]>([]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const data = await getWeather();
        setTemperature(data.temperature);
        setTime(data.time);
      } catch (error) {
        console.error("Hava durumu verileri alınamadı:", error);
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <div className='flex flex-col w-screen h-screen bg-zinc-900 items-center justify-center'>
      <div className='flex flex-row bg-zinc-800 p-8 h-24 w-[800px] rounded-3xl shadow-2xl'>
        <h1 className='text-white text-3xl font-bold'>Weather</h1>
        <h1 className='text-zinc-500 text-xl mt-3 ml-4'>{new Date().toLocaleDateString()}</h1>
        <button className='flex items-center justify-center ml-96 w-9 h-9 p-2 rounded-md text-white hover:border-2'><Search /></button>
        <button className='flex items-center justify-center ml-4 w-9 h-9 p-2 rounded-md text-white hover:border-2'><List /></button>
      </div>
      <div>
        {temperature && time !== null ?
          (
            <div className='w-[800px] h-96 mt-4 bg-zinc-800 p-8 rounded-3xl shadow-2xl overflow-y-auto '>
              <img src={weatherCode["0"].icon} alt="" />
            </div>
          ) : (
            <div className='w-[800px] h-24 mt-4 bg-zinc-800 p-8 rounded-3xl shadow-2xl'><span className='text-white text-xl'>No weather data found</span></div>
          )}
      </div>
    </div>
  );
}

export default App;
