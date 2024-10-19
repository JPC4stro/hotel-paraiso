const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const reservationsFile = 'reservations.json';

const loadReservations = () => {
    if (!fs.existsSync(reservationsFile)) {
        fs.writeFileSync(reservationsFile, JSON.stringify({ reservations: [] }));
    }
    const data = fs.readFileSync(reservationsFile);
    return JSON.parse(data);
};

const saveReservations = (data) => {
    fs.writeFileSync(reservationsFile, JSON.stringify(data, null, 2));
};

app.post('/reservar', (req, res) => {
    const { name, email, phone, arrival_date, departure_date, room_type, guests } = req.body;

    const reservationsData = loadReservations();
    const today = new Date();
    const arrivalDate = new Date(arrival_date);
    const departureDate = new Date(departure_date);
    
    const isRoomAvailable = reservationsData.reservations.every(reservation => {
        return !(reservation.room_type === room_type &&
            ((arrivalDate >= new Date(reservation.arrival_date) && arrivalDate < new Date(reservation.departure_date)) ||
             (departureDate > new Date(reservation.arrival_date) && departureDate <= new Date(reservation.departure_date))));
    });

    if (!isRoomAvailable) {
        return res.json({ success: false, message: 'Lo sentimos, no hay disponibilidad para la habitación seleccionada en las fechas selecionadas.' });
    }

    reservationsData.reservations.push({
        name,
        email,
        phone,
        arrival_date,
        departure_date,
        room_type,
        guests
    });

    saveReservations(reservationsData);
    res.json({ success: true, message: 'Su reservación se ha realizado con éxito.' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
