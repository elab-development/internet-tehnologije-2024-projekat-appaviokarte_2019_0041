 

Kratak opis
-----------
SkyReserve je SPA aplikacija za pretragu letova i online rezervacije sa korisničkim i administratorskim delom.
Korisnici mogu da se registruju/prijave, pretraže letove po polaznom/odredišnom aerodromu i datumu, naprave rezervaciju za više putnika i preuzmu „boarding pass” kao PDF. Administratori mogu da upravljaju aerodromima, letovima i putnicima, kao i da uvoze osnovne podatke o aerodromima iz eksternog servisa (po IATA/ICAO kodu).

Glavne funkcionalnosti
----------------------
• Registracija i prijava korisnika (token-based auth).
• Pretraga letova sa serverskom paginacijom.
• Kreiranje rezervacije (više putnika, izračun ukupne cene).
• Otkazivanje rezervacije uz potvrdu i ažuriranje liste.
• Generisanje i preuzimanje „boarding pass“ PDF karte (jsPDF).
• Admin: CRUD nad aerodromima i letovima.
• Admin: Uvoz aerodroma iz spoljnog API‑ja po IATA/ICAO kodu.
• Admin: Rad sa putnicima po rezervaciji (učitavanje po Booking ID ili PNR).

Tehnologije
-----------
• React (funkcionalne komponente, hook‑ovi)
• Axios (komunikacija sa REST API‑jem)
• jsPDF (generisanje PDF karti)
• Vite (dev server i build)
• Eksterni servis: API Ninjas (airports endpoint) za import aerodroma

 

Pokretanje (dev)
----------------
1) Instalacija zavisnosti:
   npm install

2) Pokretanje dev servera:
   npm run dev

3) Otvorite URL koji Vite ispiše (npr. http://localhost:3000).
   Backend treba da bude dostupan na VITE_API_BASE_URL (npr. http://localhost:8000).

Build i lokalni preview
-----------------------
• Produkcijski build:
  npm run build

• Lokalni preview buildu:
  npm run preview
 
