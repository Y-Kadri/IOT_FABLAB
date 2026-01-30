from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, TIMESTAMP

class ZoneEnum(str, Enum):
    Carpentry = "Carpentry"
    Electronics = "Electronics"
    Laser = "Laser"

class Zone(SQLModel, table=True):
    __tablename__ = "zone"

    id_zone: Optional[int] = Field(default=None, primary_key=True)
    name: str

    temperature_data: List["TemperatureData"] = Relationship(back_populates="zone")
    gas_data: List["GasConcentration"] = Relationship(back_populates="zone")
    humidity_data: List["HumidityData"] = Relationship(back_populates="zone")
    movement_data: List["MovementData"] = Relationship(back_populates="zone")
    noise_data: List["NoiseData"] = Relationship(back_populates="zone")
    
class TemperatureData(SQLModel, table=True):
    __tablename__ = "temperature_data"

    id_temperature: Optional[int] = Field(default=None, primary_key=True)
    temperature: Optional[float] = None
    datereceive: datetime = Field(
        sa_column=Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    )

    id_zone: int = Field(foreign_key="zone.id_zone")
    zone: Optional[Zone] = Relationship(back_populates="temperature_data")
    
class GasConcentration(SQLModel, table=True):
    __tablename__ = "gas_concentration"

    id_gas: Optional[int] = Field(default=None, primary_key=True)
    gasconcentration: Optional[float] = None
    datereceive: datetime = Field(
        sa_column=Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    )

    id_zone: int = Field(foreign_key="zone.id_zone")
    zone: Optional[Zone] = Relationship(back_populates="gas_data")


class HumidityData(SQLModel, table=True):
    __tablename__ = "humidity_data"

    id_humidity: Optional[int] = Field(default=None, primary_key=True)
    humidity: Optional[float] = None
    datereceive: datetime = Field(
        sa_column=Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    )

    id_zone: int = Field(foreign_key="zone.id_zone")
    zone: Optional[Zone] = Relationship(back_populates="humidity_data")


class MovementData(SQLModel, table=True):
    __tablename__ = "movement_data"

    id_movement: Optional[int] = Field(default=None, primary_key=True)
    movement: bool
    datereceive: datetime = Field(
        sa_column=Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    )

    id_zone: int = Field(foreign_key="zone.id_zone")
    zone: Optional[Zone] = Relationship(back_populates="movement_data")


class NoiseData(SQLModel, table=True):
    __tablename__ = "noise_data"

    id_noise: Optional[int] = Field(default=None, primary_key=True)
    noise: int
    datereceive: datetime = Field(
        sa_column=Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    )

    id_zone: int = Field(foreign_key="zone.id_zone")
    zone: Optional[Zone] = Relationship(back_populates="noise_data")
    
