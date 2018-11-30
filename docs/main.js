let fileInput = document.querySelector(".file-input");
let applyFilterBtn = document.querySelector(".filter-button__apply");
let clearFilterBtn = document.querySelector(".filter-button__clear");
let filterNotifications = document.querySelector(".filter-notifications");
let parsedData;
let filteredData;
let sortedBy = {
  field: "",
  asc: false
};

let jsonToArray = json => {
  var ret = new Array();
  var key;
  for (key in json) {
    ret.push(jsonKeyValueToArray(key, json[key]));
  }
  return ret;
};

let ascending = (a, b) => {
  return a > b ? 1 : a === b ? 0 : -1;
};
let descending = (a, b) => {
  return a < b ? 1 : a === b ? 0 : -1;
};
let stringCompare = (a, b, fieldName) => {
  a = parseInt(a) ? parseInt(a) : a.toLowerCase();
  b = parseInt(b) ? parseInt(b) : b.toLowerCase();

  if (sortedBy.field === fieldName && sortedBy.asc === true) {
    return descending(a, b);
  } else {
    return ascending(a, b);
  }
};
let jsonKeyValueToArray = (k, v) => {
  return [k, v];
};

function sortAndUpdate(fieldName) {
  if (sortedBy.field === fieldName && sortedBy.asc) {
    sortedBy.asc = false;
  } else if (sortedBy.field !== fieldName) {
    sortedBy.field = fieldName;
    sortedBy.asc = false;
  } else {
    sortedBy.field = fieldName;
    sortedBy.asc = true;
  }

  parsedData.sort(function(a, b) {
    return a === null || b === null
      ? 0
      : stringCompare(a[fieldName], b[fieldName], fieldName);
  });

  // update the table
  createParsedDataTable(parsedData);
}

let createFilterOptions = filterOptions => {
  let filterOptionList = document.querySelector(".filter-list__items");

  return filterOptions.map(option => {
    filterOptionList.options[filterOptionList.options.length] = new Option(
      option,
      option
    );
  });
};

let notify = (notificationText, nType) => {
  let visibleErrors = document.querySelectorAll(".filter-error");
  let notification = document.createElement("div");

  if (visibleErrors.length) {
    filterNotifications.innerHTML = "";
  }

  notification.innerText = notificationText;
  notification.className = `filter-${nType}`;
  filterNotifications.appendChild(notification);
};

let applyFilter = () => {
  let filterOptionList = document.querySelector(".filter-list__items");
  let filterSearchBar = document.querySelector(".search-bar");
  let selectedOption =
    filterOptionList.options[filterOptionList.selectedIndex].value;

  if (!filterSearchBar.value) {
    notify("please provide a filter value", "error");
    return;
  }

  filteredData = filteredData.filter(record => {
    return (
      record[selectedOption].toLowerCase() ===
      filterSearchBar.value.toLowerCase()
    );
  });
  notify(`${selectedOption} = ${filterSearchBar.value}`, "text");
  createParsedDataTable(filteredData);
};

applyFilterBtn.addEventListener("click", applyFilter);
clearFilterBtn.addEventListener("click", () => {
  let filterOptionList = document.querySelector(".filter-list__items");
  let filterSearchBar = document.querySelector(".search-bar");

  filterOptionList.selectedIndex = 0;
  filterSearchBar.value = "";
  filterNotifications.innerHTML = "";

  parsedData
    ? createParsedDataTable(parsedData)
    : notify("please upload a file", "error");
});

let createParsedDataTable = data => {
  // remove existing table
  d3.select("tbody")
    .selectAll("tr")
    .remove();
  //create table container
  var table = d3.select(".table-container");
  //draw table
  var headers = table
    .select("tr")
    .selectAll("th")
    .data(jsonToArray(data[0]))
    .enter()
    .append("th")
    .attr("onclick", function(d, i) {
      return "sortAndUpdate('" + d[0] + "');";
      // return sortAndUpdate(d[0]);
    })
    .text(function(d) {
      return d[0];
    });

  var rows = table
    .select("tbody")
    .selectAll("tr")
    .data(data, function(d) {
      return d.id;
    })
    .enter()
    .append("tr");

  var cell = rows
    .selectAll("td")
    .data(function(d) {
      return jsonToArray(d);
    })
    .enter()
    .append("td")
    .text(function(d) {
      return d[1];
    });
};

let parseCsv = csv => {
  parsedData = d3.csvParse(csv);
  filteredData = parsedData;
  let dataColNames = Object.keys(parsedData[0]);
  let defaultSortbyCol = dataColNames[0];
  createFilterOptions(dataColNames);
  sortAndUpdate(defaultSortbyCol);
};

fileInput.onchange = event => {
  let csvFile = fileInput.files[0];
  let reader = new FileReader();
  // Read file into memory as UTF-8
  reader.readAsText(csvFile);
  reader.onload = evt => {
    parseCsv(evt.target.result);
  };
};
