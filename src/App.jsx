import { useState } from 'react'
import { data } from './data.js'
import { ResponsiveStackedAreaGraph  } from './StackedAreaGraph.jsx'
import { ResponsiveBarplot } from './Barplot.jsx'
import { ResponsiveDonutChart } from './DonutChart.jsx'
import { ResponsiveLineChart } from './LineChart.jsx'
import './App.css'

const sources_time = data
  .filter(d => d.country === "World")
    .map(d => ({
    x: d.year,
    oil: d.oil,
    coal: d.coal,
    gas: d.gas,
    hydro: d.hydro,
    nuclear: d.nuclear,
    wind: d.wind,
    solar: d.solar,
    "other renewable": d.other_renewable + d.biofuel
  }));


const countries = data
  .filter(d => d.country !== "World" && d.year === 2024)
  .map(d => ({
    name: d.country.replace("United Kingdom", "UK").replace("United Arab Emirates", "UAE"),
    value: d.primary_energy
  }))
  .sort((a, b) => b.value - a.value);

const recent_year = data
  .filter(d => d.country == "World" && d.year === 2024)
  .flatMap(d => Object.entries({
    coal: d.coal,
    oil: d.oil,
    gas: d.gas,
    nuclear: d.nuclear,
    hydro: d.hydro,
    solar: d.solar,
    wind: d.wind,
    "other renewable": d.other_renewable + d.biofuel
  }).map(([name, value]) => ({ name, value })))

const data_filtered = data.filter(d => d.country === "World");

const renewable_time = {
  "other renewable": data_filtered.map(d => ({
  x: d.year,
  y: (d.other_renewable ?? 0) + (d.biofuel ?? 0)
})),
  solar: data_filtered.map(d => ({ x: d.year, y: d.solar ?? 0 })),
  wind: data_filtered.map(d => ({ x: d.year, y: d.wind ?? 0 })),
  nuclear: data_filtered.map(d => ({ x: d.year, y: d.nuclear ?? 0 })),
  hydro: data_filtered.map(d => ({ x: d.year, y: d.hydro ?? 0 })),
};

function App() {
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);

  return (
    <>
       <div className="container">

      {/* TOP SECTION */}
      <div className="top">

        {/* LEFT */}
        <div
          className="left"
          style={{ borderRight: "1px dashed #cbcfd1", padding: "10px" }}
        >
          <h2>Energy consumption</h2>
          <span className="subtitle">
            Primary energy in terawatt-hours in 2024
          </span>
          <ResponsiveBarplot 
            data={countries} 
            height={620} 
            hoveredCountry={hoveredCountry}
            setHoveredCountry={setHoveredCountry}
              />
        </div>

        {/* RIGHT */}
        <div className="right" style={{ display: "flex", flexDirection: "column" }}>

          <div style={{ borderBottom: "1px dashed #cbcfd1", padding: "10px" }}>
            <h2>Global energy mix over time</h2>
            <span className="subtitle">
              Global primary energy in terawatt-hours
            </span>
            <ResponsiveStackedAreaGraph 
              data={sources_time} 
              height={260} 
              hoveredGroup={hoveredGroup}
              setHoveredGroup={setHoveredGroup}
              />
          </div>

          <div style={{ padding: "10px" }}>
            <h2>Global energy mix in 2024</h2>
            <span className="subtitle">
              Global primary energy in terawatt-hours in 2024
            </span>
            <ResponsiveDonutChart 
              data={recent_year} 
              height={260} 
              hoveredGroup={hoveredGroup}
              setHoveredGroup={setHoveredGroup}
              />
          </div>

        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div style={{ borderTop: "1px dashed #cbcfd1", padding: "10px" }}>
        <h2>Development of renewables</h2>
        <span className="subtitle">
          Global renewable energy in terawatt-hours
        </span>
        <ResponsiveLineChart 
          data={renewable_time} 
          height={300}
        />
      </div>

    </div>
    </>
  )
}

export default App