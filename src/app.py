# src/app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3

app = FastAPI(title="API Encuesta Estadística UTP", version="1.0")

# Habilitar CORS para permitir la comunicación entre el frontend y la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de la Base de Datos SQLite
DB_NAME = "encuesta.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS respuestas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            carrera TEXT,
            anio TEXT,
            gpa REAL,
            idePrincipal TEXT,
            cant_ides INTEGER,
            horas_prog TEXT,
            lenguaje TEXT,
            usaTerminal TEXT,
            nivelTerminal TEXT,
            frecuenciaGit INTEGER,
            scriptBash TEXT,
            numRepositorio INTEGER,
            escalaOptima INTEGER,
            porcErrores TEXT,
            perdidaCodigo TEXT,
            influenciaCali INTEGER,
            horasAhorradas TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

# Inicializar la base de datos al arrancar
init_db()

# Estructura de datos validada con Pydantic
class EncuestaItem(BaseModel):
    carrera: str
    anio: str
    gpa: float
    idePrincipal: str
    cant_ides: int
    horas_prog: str
    lenguaje: str
    usaTerminal: str
    nivelTerminal: str
    frecuenciaGit: int
    scriptBash: str
    numRepositorio: int
    escalaOptima: int
    porcErrores: str
    perdidaCodigo: str
    influenciaCali: int
    horasAhorradas: str

@app.post("/api/respuestas")
def guardar_respuesta(item: EncuestaItem):
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO respuestas (
                carrera, anio, gpa, idePrincipal, cant_ides, horas_prog, lenguaje,
                usaTerminal, nivelTerminal, frecuenciaGit, scriptBash, numRepositorio,
                escalaOptima, porcErrores, perdidaCodigo, influenciaCali, horasAhorradas
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item.carrera, item.anio, item.gpa, item.idePrincipal, item.cant_ides,
            item.horas_prog, item.lenguaje, item.usaTerminal, item.nivelTerminal,
            item.frecuenciaGit, item.scriptBash, item.numRepositorio, item.escalaOptima,
            item.porcErrores, item.perdidaCodigo, item.influenciaCali, item.horasAhorradas
        ))
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Datos almacenados en SQLite correctamente."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/respuestas")
def obtener_respuestas():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM respuestas")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("scr.app:app", host="0.0.0.0", port=port, reload=True)