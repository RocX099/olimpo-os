FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css app.js FORMULARIO_OLIMPO_OS.html FORMULARIO_OLIMPO_OS_EN.html /usr/share/nginx/html/
EXPOSE 80
