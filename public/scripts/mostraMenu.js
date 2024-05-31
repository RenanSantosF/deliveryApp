const showMenu = (toggleId, navId) =>{
  const toggle = document.getElementById(toggleId),
  nav = document.getElementById(navId)

  toggle.addEventListener('click', () =>{
      nav.classList.toggle('show-menu')

      toggle.classList.toggle('show-icon')
  })
}

export default showMenu

