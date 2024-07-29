/* globals IntersectionObserver */
// ==================================
// VARIABLES
// ==================================

const api = 'https://fake-coffee-api.vercel.app/api'
const coffeeList = document.querySelector('.coffee-blends')
const spinner = document.querySelector('.spinner')
const hiddenItems = [...document.querySelectorAll('.hidden')]
const itemsToDispay = 4

const toggle = document.querySelector('.mobile-toggle')
const navList = document.querySelector('.primary-nav__list')

// ==================================
// FUNCTIONS
// ==================================

/**
 * Creates an HTML string from an array and adds it to DOM
 * @param {Array} productList An array of products to add to DOM
 */
function addProductsToDOM (productList) {
  const string = productList
    .map(product => {
      const { desc, imgUrl, name, price, weight } = product
      // const fixedUrl = imgUrl.replace('https://', 'https://www.')

      return `<li class="item">
        <a href="#">
              <article class="flow">
              <div class="item__img"> 
                      <img src=${imgUrl.includes('https://www.') ? imgUrl : 'https://images.unsplash.com/photo-1651761483492-7d2e26dd3455?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTg1MzI3MzR8&ixlib=rb-4.0.3&q=85'} alt="a bag of ${name} coffee">
                  </picture>
              </div>
              <div class="item__content">
                  <header class="flow">
                      <h3 class="item__name">${name}</h3>
                      <p class="item__desc">${desc}</p>
                  </header>

                <dl class="item__info">

                  <div class="item__info__weight">
                      <dt>Weight:</dt>
                      <dd>${weight} <span>g</span></dd>
                  </div>
                  <div class="item__info__price">
                      <dt class="visually-hidden">Price:</dt>
                      <dd><span>$</span>${price}</dd>
                  </div>
                  
                </dl>
                  <button type="button" class="button item__button" data-button="primary">Add To Cart</button>
              </div>
          </article>
        </a>
    </li>`
    })
    .join('')

  coffeeList.innerHTML = coffeeList.innerHTML + string
}

/**
 * Fetches data from API and adds it to DOM while controling the siplay of spinner and newsletter section
 */
async function getCoffee () {
  try {
    const data = await fetch(`${api}`)
    const response = await data.json()
    spinner.dataset.availableBatches = Math.round(
      response.length / itemsToDispay
    )

    const coffeeItems = response
      .map(item => {
        return {
          id: item.id,
          desc: item.description,
          imgUrl: item.image_url,
          name: item.name,
          price: item.price,
          weight: item.weight
        }
      })
      .filter(item => {
        const { startIndex, endIndex } = spinner.dataset
        return item.id >= startIndex && item.id <= endIndex
      })

    addProductsToDOM(coffeeItems)
  } catch (error) {
    console.log(error)
  }

  spinner.dataset.currentPage = `${parseInt(spinner.dataset.currentPage) + 1}`
  spinner.dataset.startIndex = `${parseInt(spinner.dataset.endIndex) + 1}`
  spinner.dataset.endIndex = `${
    parseInt(spinner.dataset.endIndex) + itemsToDispay
  }`

  if (spinner.dataset.currentPage === spinner.dataset.availableBatches) {
    spinner.style.setProperty('display', 'none')
    hiddenItems.forEach(item => {
      item.classList.remove('hidden')
    })
  }
}

/**
 * Opens mobile menu
 */
function openMenu () {
  navList.setAttribute('data-state', 'is-open')
  toggle.setAttribute('aria-expanded', 'true')
}

/** Closes mobile menu */
function closeMenu () {
  navList.setAttribute('data-state', 'is-closing')
  toggle.setAttribute('aria-expanded', 'false')
}


// ==================================
// EXECUTION
// ==================================

spinner.dataset.currentPage = '0'
spinner.dataset.startIndex = '1'
spinner.dataset.endIndex = `${itemsToDispay}`

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      getCoffee()
    }
  })
})

observer.observe(spinner)

toggle.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true'

  isOpen ? closeMenu() : openMenu()
})

document.body.addEventListener('animationend', e => {
  if (e.animationName === 'closeMenu') {
    navList.setAttribute('data-state', 'is-closed')
  }
})

