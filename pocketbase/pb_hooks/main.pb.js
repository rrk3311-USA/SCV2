// Redirect root (/) to admin UI (/_/)
routerAdd("GET", "/", (e) => {
  return e.redirect(302, "/_/")
})
