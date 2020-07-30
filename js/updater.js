/**
 * @fileoverview Display current status of Fermi Enclosures from OAC and allow updates
 * @author beau@fnal.gov (Beau Harrison)
 */

function sortObjectArray(array) {
  const newArray = array || []
  return newArray.sort((a, b) => parseFloat(a.id) - parseFloat(b.id))
}

function buildEnclosures(json) {
  const main = document.querySelector('main')

  if (window.sort) json = sortObjectArray(json)

  for (let enclosure of json) {
    const row = document.createElement('div')
    const encSpan = document.createElement('span')
    const statSelect = document.createElement('select')

    row.className = 'row'

    encSpan.className = 'enclosure'
    encSpan.setAttribute('name', 'enclosureName')
    encSpan.id = enclosure.id
    encSpan.textContent = enclosure.name

    statSelect.className = 'status'
    statSelect.setAttribute('name', 'statusID')
    statSelect.id = enclosure.id

    row.appendChild(encSpan)
    row.appendChild(statSelect)
    main.appendChild(row)
  }
}

function updateStatus(response) {
  const enclosureID = response.target.id
  const statusID = response.target.selectedOptions[0].value
  const enclosureName = response.target.previousSibling.textContent
  const statusName = response.target.selectedOptions[0].textContent
  const url = 'https://www-bd.fnal.gov/EnclosureStatus/addEntry'
  const request = `?enclosureID=${enclosureID}&statusID=${statusID}`

  fetch(url + request, { method: 'POST' })
    .then(() => {
      alert(`Successfully changed ${enclosureName} to ${statusName}`)
    })
    .catch((err) => alert('ERROR: ', err))
}

function buildStatuses(json) {
  const selects = document.querySelectorAll('select[name="statusID"]')

  for (let select of selects) {
    for (let stat of json) {
      const option = document.createElement('option')

      option.setAttribute('name', 'statusID')
      option.value = stat.id
      option.textContent = stat.name

      select.appendChild(option)
    }

    select.addEventListener('change', updateStatus, false)
  }
}

function setSelected(json) {
  for (let entry of json) {
    const selector = `select[id="${entry.enclosure.id}"] option[value="${entry.status.id}"]`
    document.querySelector(selector).setAttribute('selected', 'selected')
  }
}

function init() {
  document.querySelector('main').innerHTML = ''

  const url = 'https://www-bd.fnal.gov/EnclosureStatus/'
  // const url = 'https://localhost:3000/'

  fetch(url + 'getAllEnclosures')
    .then((response) => {
      response.json().then(buildEnclosures)

      fetch(url + 'getAllStatuses')
        .then((response) => {
          response.json().then(buildStatuses)

          fetch(url + 'getCurrentEntries')
            .then((response) => response.json().then(setSelected))
        })
    })
}

function toggleSort() {
  window.sort = !window.sort
  init()
}

// Self executing function as initializer
(function(){
  window.sort = true
  init()
  document.querySelector('header')
    .addEventListener('click', toggleSort, false)
})()
