import { useState, useEffect } from 'react';
import axios from 'axios';

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

  const weatherData: any = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${locationData.lat}&longitude=${locationData.lon}&hourly=temperature_2m`)
    .then((response) => {
      return response.data;
    });

  const time = new Date().getHours();

  return {
    temperature: weatherData.hourly.temperature_2m.slice(time, time + 12),
    time: weatherData.hourly.time.slice(time, time + 12)
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
    <div>
      <h1>Hava Durumu</h1>
      <div>
        {time.map((t, index) => (
          <div key={index}>
            <span>{t}</span>: <span>{temperature[index]}°C</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
