const totalRevenue = document.getElementById('total_revenue');
const pieDiv = document.getElementById('pie');
const histogramDiv = document.getElementById('histrogram');
const barDiv = document.getElementById('bar');
const api = "api/1.0";

class Pie {
    constructor() {
        this.data;
        this.layout;
    }
    async getdata() {
        const result = await fetch(`/${api}/dummy/pie`)
        const jsonData = await result.json()
        const data = [{
            values: jsonData.data.map(item => item.percentage),
            labels: jsonData.data.map(item => item.color_name),
            marker: {
                colors: jsonData.data.map(item => item.color_code)
            },
            type: 'pie'
        }]
        const layout = {
            title: 'Product sold percentage in different colors',
            height: 400,
            width: 500
        };
        this.data = data
        this.layout = layout
    }
}

class Histogram {
    constructor() {
        this.data;
        this.layout;
    }
    async getdata() {
        const result = await fetch(`/${api}/dummy/histogram`)
        const jsonData = await result.json()

        const trace = {
            x: jsonData.data,
            type: 'histogram',
            xbins: {
                end: 2000,
                size: 20,
                start: 500
            }

        }
        this.data = [trace]
        this.layout = {
            title: "Product sold quantity price range",
            xaxis: { title: "Price Range" },
            yaxis: { title: "Quantity" },
        };
    }
}

class Bar {
    constructor() {
        this.data;
        this.layout;
    }
    async getdata() {
        const result = await fetch(`/${api}/dummy/bar`)
        const jsonData = await result.json()
        const topFiveName = jsonData.data.topFive
        const sizeSalesData = jsonData.data.sizeSales
        const traceS = {
            x: topFiveName,
            y: sizeSalesData.s,
            name: 'S',
            type: 'bar'
        }
        const traceM = {
            x: topFiveName,
            y: sizeSalesData.m,
            name: 'M',
            type: 'bar'
        }
        const traceL = {
            x: topFiveName,
            y: sizeSalesData.l,
            name: 'L',
            type: 'bar'
        }
        this.data = [traceL, traceM, traceS]
        this.layout = {
            barmode: 'stack',
            title: "Quantity of top 5 sold products in defferent sizes ",
            xaxis: { title: "Top 5 Products" },
            yaxis: { title: "Quantity" },
        }
    }
}

const createTotalRevenue = async () => {
    const result = await fetch(`/${api}/dummy/total`)
    const jsonData = await result.json()
    totalRevenue.innerHTML = `<div id="number">Total Revenue: ${(jsonData.data.total_revenue)}</div>`
}

const createPie = async () => {
    const pie = new Pie()
    await pie.getdata()
    Plotly.newPlot(pieDiv, pie.data, pie.layout);
}

const createHistogram = async () => {
    const histogram = new Histogram()
    await histogram.getdata()
    Plotly.newPlot(histogramDiv, histogram.data, histogram.layout);
}

const createBar = async () => {
    const bar = new Bar()
    await bar.getdata()
    Plotly.newPlot(barDiv, bar.data, bar.layout);
}

createTotalRevenue()
createPie()
createHistogram()
createBar()
