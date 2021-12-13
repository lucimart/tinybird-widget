"use strict";

// Tinybird vars
const TOKEN =
  "p.eyJ1IjogIjdmOTIwMmMzLWM1ZjctNDU4Ni1hZDUxLTdmYzUzNTRlMTk5YSIsICJpZCI6ICJmZTRkNWFiZS05ZWIyLTRjMjYtYWZiZi0yYTdlMWJlNDQzOWEifQ.P67MfoqTixyasaMGH5RIjCrGc0bUKvBoKMwYjfqQN8c";
const tinyb = tinybird(TOKEN);
const pipe = tinyb.pipe("yellow_tripdata_2017_pipe");

// Selectors
const averagePassengers = document.getElementById("average-passengers");
const averageTip = document.getElementById("average-tip");
const averageTripDistance = document.getElementById("average-trip-distance");
const averageTripTime = document.getElementById("average-trip-time");
const formFrom = document.getElementById("form-from");
const formRadio1 = document.getElementById("form-vendor-1");
const formRadio2 = document.getElementById("form-vendor-2");
const formRadioAll = document.getElementById("form-vendor-all");
const formRadios = document.getElementById("filterForm").formVendor;
const formTo = document.getElementById("form-to");
const paidCard = document.getElementById("paid-card");
const paidCash = document.getElementById("paid-cash");
const totalEarnings = document.getElementById("total-earnings");
const tripCount = document.getElementById("trip-count");
const tipPerc = document.getElementById("tip-perc");
// vars
let vendor = "all";
let d1 = "2017-01-01";
let d2 = "2017-12-31";
let hash = { vendor: vendor, from: d1, to: d2 };

//functions

const queryAndSet = async (
  q = `select sum(total_amount) as total_earnings,
  avg(passenger_count) as passenger_count,
  avg(datediff(minute, tpep_pickup_datetime, tpep_dropoff_datetime)) as time_elapsed,
  100*sum(case when payment_type = '1' then 1 else 0 end)/count(*) as cash_perc,
  100*sum(case when payment_type = '2' then 1 else 0 end)/count(*) as card_perc,
  avg(trip_distance) as avg_trip_distance,
  avg(tip_amount) as avg_tip_amount,
  (100*avg_tip_amount)/avg(total_amount) as avg_tip_amount_perc,
  count(*) as total_trips
  from _ where ${hash.vendor === "all" ? "" : `vendorid=${hash.vendor} and `}
  tpep_pickup_datetime between '${hash.from} 00:00:00' 
  and '${hash.to} 23:59:59'`
) => {
  const res = await pipe.json(q);
  if (res.error) {
    console.error(`there is a problem running the query: ${res.error}`);
  } else if (res.data) {
    const data = res.data[0];
    totalEarnings.innerHTML = `$${Math.round(
      data.total_earnings
    ).toLocaleString()}`;
    averagePassengers.innerHTML = data.passenger_count.toFixed(2);
    averageTripTime.innerHTML = `${data.time_elapsed.toFixed(2)} min.`;
    tripCount.innerHTML = data.total_trips.toLocaleString();
    paidCard.innerHTML = `${data.card_perc.toFixed(2)}%`;
    paidCash.innerHTML = `${data.cash_perc.toFixed(2)}%`;
    averageTripDistance.innerHTML = `${data.avg_trip_distance.toFixed(2)} mi.`;
    averageTip.innerHTML = `$${data.avg_tip_amount.toFixed(2)}`;
    tipPerc.innerHTML = `(${data.avg_tip_amount_perc.toFixed(
      2
    )}% of total trip amount)`;
  }
};

//Handlers
const radioClickHandler = (e) => {
  const val = e.target.value;
  hash.vendor = val;
  window.location.hash = btoa(JSON.stringify(hash));
  queryAndSet();
};

const fromChangeHandler = (e) => {
  const val = e.target.value;
  formTo.min = val;
  hash.from = val;
  window.location.hash = btoa(JSON.stringify(hash));
  queryAndSet();
};

const toChangeHandler = (e) => {
  const val = e.target.value;
  formFrom.max = val;
  hash.to = val;
  window.location.hash = btoa(JSON.stringify(hash));
  queryAndSet();
};

// onLoad
const bodyLoadHandler = async () => {
  if (window.location.hash) {
    hash = JSON.parse(atob(window.location.hash.substring(1)));
    switch (hash.vendor) {
      case "1":
        formRadio1.checked = true;
        break;
      case "2":
        formRadio2.checked = true;
        break;
      case "all":
      default:
        formRadioAll.checked = true;
    }
    formFrom.value = hash.from;
    formTo.value = hash.to;
    formTo.min = hash.to;
    formFrom.max = hash.from;
  }
  queryAndSet();
};

// event listeners
formFrom.addEventListener("change", fromChangeHandler);
formTo.addEventListener("change", toChangeHandler);
formRadios.forEach((radio) =>
  radio.addEventListener("click", radioClickHandler)
);
