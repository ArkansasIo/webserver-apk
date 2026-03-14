FROM php:8.3-apache

RUN docker-php-ext-install pdo pdo_mysql

WORKDIR /var/www/html

COPY public ./public
COPY src ./src

RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

EXPOSE 80
