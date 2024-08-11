import axios from 'axios';
import weatherCodeJson from './lib/weathercode.json';
import { useState, useEffect } from 'react';
import { Search, Droplet, Umbrella, ArrowRight } from 'lucide-react';

interface WeatherIcon {
  description: string;
  icon: string;
  iconNight?: string;
}

interface WeatherCode {
  [key: string]: WeatherIcon;
}
const data: WeatherCode = weatherCodeJson;
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

  const weatherData: any = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${locationData.lat}&longitude=${locationData.lon}&current=is_day&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m`)
    .then((response) => {
      console.log(response.data);
      return response.data;
    });

  const time = new Date().getHours();

  return {
    temperature: weatherData.hourly.temperature_2m.slice(time, time + 12),
    time: weatherData.hourly.time.slice(time, time + 12),
    weatherCode: weatherData.hourly.weather_code,
    wind_direction_10m: weatherData.hourly.wind_direction_10m.slice(time, time + 12),
    wind_speed_10m: weatherData.hourly.wind_speed_10m.slice(time, time + 12),
    precipitation_probability: weatherData.hourly.precipitation_probability.slice(time, time + 12),
    precipitation: weatherData.hourly.precipitation.slice(time, time + 12),
    relative_humidity_2m: weatherData.hourly.relative_humidity_2m.slice(time, time + 12),
    isDay: weatherData.current.is_day
  };
}

async function getCityWeather(city: string) {
  const cityCords: any = await axios.get(`https://geocode.maps.co/search?q=${city}&api_key=66b803acd8c50866798138gan0c1e1d`)
    .then((response) => {
      console.log(response.data);
      return response.data[0]
    })
  const weatherData: any = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${cityCords.lat}&longitude=${cityCords.lon}&current=is_day&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m`)
    .then((response) => {
      console.log(response.data);
      return response.data;
    });
  return weatherData
}

function App() {
  const [temperature, setTemperature] = useState<number[]>([]);
  const [time, setTime] = useState<string[]>([]);
  const [windSpeed, setWindSpeed] = useState<number[]>([]);
  const [precipitationProbability, setPrecipitationProbability] = useState<number[]>([]);
  const [weatherCode, setWeatherCode] = useState<number[]>([]);
  const [humidity, setHumidity] = useState<number[]>([]);
  const [weatherNow, setWeatherNow] = useState<string>("");
  const [isDay, setIsDay] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const data = await getWeather();
        setTemperature(data.temperature);
        setTime(data.time);
        setWindSpeed(data.wind_speed_10m);
        setPrecipitationProbability(data.precipitation_probability);
        setWeatherCode(data.weatherCode);
        setHumidity(data.relative_humidity_2m);
        const currentWeatherCode = data.weatherCode[0];
        setWeatherNow(currentWeatherCode.toString());
        setIsDay(data.isDay)
      } catch (error) {
        console.error("Hava durumu verileri alınamadı:", error);
      }
    };

    fetchWeatherData();
  }, []);

  const cityWeather = async (city: string) => {
    const weatherData: any = await getCityWeather(city)
    setTemperature(weatherData.hourly.temperature_2m.slice(0, 24));
    setTime(weatherData.hourly.time.slice(0, 24));
    setWindSpeed(weatherData.hourly.wind_speed_10m.slice(0, 24));
    setPrecipitationProbability(weatherData.hourly.precipitation_probability.slice(0, 24));
    setWeatherCode(weatherData.hourly.weather_code.slice(0, 24));
    setHumidity(weatherData.hourly.relative_humidity_2m.slice(0, 24));
    const currentWeatherCode = weatherData.hourly.weather_code[0];
    setWeatherNow(currentWeatherCode.toString());
    setIsDay(weatherData.current.is_day)
  }

  return (
    <div className='flex flex-col w-screen h-screen bg-zinc-900 items-center justify-start'>
      <div className='flex flex-row bg-zinc-800 p-8 mt-6 h-24 w-[800px] rounded-3xl shadow-2xl'>
        <h1 className='text-white text-3xl font-bold'>Weather</h1>
        <h1 className='text-zinc-500 text-xl mt-3 ml-4'>{new Date().toLocaleDateString()}</h1>
        <div className='ml-72 flex flex-row relative'>
          <Search className='text-zinc-400 absolute top-1 left-2' />
          <input className='pl-9 bg-zinc-700 rounded-2xl text-white' onChange={(e) => cityWeather(e.target.value)} type="text" placeholder="Search" />
        </div>
      </div>
      <div>
        {temperature.length && time.length ? (
          <div className='w-[800px] h-[400px] mt-4 bg-zinc-800 p-8 rounded-3xl shadow-2xl overflow-y-auto flex flex-col'>
            <div className='flex flex-row'>
              <img className='w-[90px] h-[90px]' src={isDay ? data[weatherNow]?.icon : (data[weatherNow]?.iconNight ? data[weatherNow]?.iconNight : data[weatherNow]?.icon)} alt="Weather icon" />
              <h1 className='text-white ml-[430px] text-7xl font-bold'>{temperature[0]}°C</h1>
            </div>
            <h1 className='text-white text-3xl font-bold mt-3'>{data[weatherNow]?.description}</h1>
            <div className='flex flex-row mt-3'>
              <div className='flex flex-row'>
                <Droplet className='text-zinc-400' width={40} height={40} />
                <h1 className='text-zinc-400 text-3xl font-medium'>{humidity[0]}%</h1>
              </div>
              <div className='flex flex-row ml-4'>
                <Umbrella className='text-zinc-400' width={40} height={40} />
                <h1 className='text-zinc-400 text-3xl font-medium ml-1'>{precipitationProbability[0]}</h1>
              </div>
              <div className='flex flex-row ml-4'>
                <h1 className='text-zinc-400 text-3xl font-medium'>{windSpeed[0]} m/s</h1>
                <ArrowRight className='text-zinc-400' width={40} height={40} />
              </div>
            </div>
            <div className='mt-4 border-2 border-zinc-600'></div>
            <div className='flex flex-row h-48 mt-4 overflow-auto'>
              {time.map((item, index) => (
                <div key={item} className='ml-2 mb-2 border-r-2 pr-2'>
                  <img src={data[weatherCode[index]]?.icon} alt="img" />
                  <h1 className='text-zinc-400 text-lg font-medium'>{temperature[index]}°C</h1>
                  <h1 className='text-white'>{time[index].split("T")[1]}</h1>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='w-[800px] h-24 mt-4 bg-zinc-800 p-8 rounded-3xl shadow-2xl'>
            <span className='text-white text-xl'>No weather data found</span>
          </div>
        )}
      </div>
      <h1 className='text-white mt-4'>Made with ❤️ by <a href="https://github.com/Sentinal" className='text-white font-bold'>Sentinal</a></h1>
      <h1 className='text-white'>Weather Data from <a href="https://open-meteo.com/" className='text-white font-bold'>Open-Meteo</a></h1>
    </div>
  );
}

export default App;