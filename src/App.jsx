import { useEffect, useState } from 'react'
import { data } from './data.js'
import { ResponsiveStackedAreaGraph  } from './StackedAreaGraph.tsx'
import { ResponsiveBarplot } from './Barplot.tsx'
import { ResponsiveDonutChart } from './DonutChart.tsx'
import { ResponsiveLineChart } from './LineChart.tsx'
import './App.css'
import { symbolAsterisk } from 'd3'

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

const renewable_time = data
  .filter(d => d.country === "World")
  .map(d => ({
    x: d.year,
    y: d.other_renewable + d.biofuel + d.solar + d.wind + d.nuclear + d.hydro
  }));

console.log(renewable_time)

function App() {
  const [count, setCount] = useState(0)

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
          <ResponsiveBarplot data={countries} height={620} />
        </div>

        {/* RIGHT */}
        <div className="right" style={{ display: "flex", flexDirection: "column" }}>

          <div style={{ borderBottom: "1px dashed #cbcfd1", padding: "10px" }}>
            <h2>Global energy mix over time</h2>
            <span className="subtitle">
              Global primary energy in terawatt-hours
            </span>
            <ResponsiveStackedAreaGraph data={sources_time} height={260} />
          </div>

          <div style={{ padding: "10px" }}>
            <h2>Global energy mix in 2024</h2>
            <span className="subtitle">
              Global primary energy in terawatt-hours in 2024
            </span>
            <ResponsiveDonutChart data={recent_year} height={260} />
          </div>

        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div style={{ borderTop: "1px dashed #cbcfd1", padding: "10px" }}>
        <h2>Development of renewables</h2>
        <span className="subtitle">
          Global renewable energy in terawatt-hours
        </span>
        <ResponsiveLineChart data={renewable_time} height={300} />
      </div>

    </div>
    </>
  )
}

export default App
