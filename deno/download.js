import { TSV } from "https://js.sabae.cc/TSV.js";
import { CSV } from "https://js.sabae.cc/CSV.js";
import { fetchOrLoad } from "https://js.sabae.cc/fetchOrLoad.js";

// https://www.data.go.jp/data/dataset/mlit_20140919_0756/resource/b5024877-1ada-4812-9d57-08d629cec933
const url = "https://oscar.wmo.int/oscar/vola/vola_legacy_report.txt";
const data = await fetchOrLoad(url);
const tsv = TSV.parse(data);

const dms2d = (d, m, s) => {
  const p = (s) => parseFloat(s);
  return p(d) + p(m) / 60 + p(s) / (60 * 60);
};
const sdms2d = (s) => {
  const minus = s.endsWith("S") || s.endsWith("W");
  const n = s.substring(0, s.length - 1).split(" ").map(s => parseInt(s, 10));
  return dms2d(n[0], n[1], n[2]) * (minus ? -1 : 1);
};
const convertLocation = (d) => {
  d.lat = parseFloat(sdms2d(d.Latitude).toFixed(4));
  d.lng = parseFloat(sdms2d(d.Longitude).toFixed(4));
};

const convert = (d) => {
  convertLocation(d);
  d.url = "https://oscar.wmo.int/surface/#/search/station/stationReportDetails/" + d.StationId;
};

tsv.forEach(t => convert(t));
await Deno.writeTextFile("../data/station.csv", CSV.stringify(tsv));
const jp = tsv.filter(t => t.CountryArea == "Japan");
await Deno.writeTextFile("../data/station_jp.csv", CSV.stringify(jp));
//convertLocation(jp[0]);
console.log(jp[0]);
