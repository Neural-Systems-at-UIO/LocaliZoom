# LocaliZoom deployment guide
## OKD
### Image
LocaliZoom is entirely static content, any web server can host it. OKD offers Apache and Nginx, the latter was picked for the actual deployment, https://github.com/sclorg/nginx-ex.
### HTTPS
While LocaliZoom technically does not require a secure route, having one is pretty much an expectation in 2023. Actual deployment uses the default "Edge" flavour.

### Collab app registration
LocaliZoom launches with `index.html`, which then can be omitted.
## Docker
Image is in the `localizoom` project, https://docker-registry.ebrains.eu/harbor/projects/98  
Again, it's suggested to secure the route, which falls outside the scope of this document.