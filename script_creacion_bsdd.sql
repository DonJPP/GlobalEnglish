use global_english;
CREATE TABLE institucion (
    id_institucion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    jornada ENUM('MANANA','TARDE','UNICA','MIXTA') NOT NULL
)
DEFAULT CHARSET=utf8mb4;

CREATE TABLE sede (
    id_sede INT  PRIMARY KEY,
    id_institucion INT NOT NULL,
    direccion_completa VARCHAR(150) NOT NULL,
    sede_principal VARCHAR(3) NOT NULL,
    
    CONSTRAINT fk_sede_institucion
        FOREIGN KEY (id_institucion)
        REFERENCES institucion(id_institucion)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
)
DEFAULT CHARSET=utf8mb4;

CREATE TABLE aula (
    id_aula INT  PRIMARY KEY,
    grado VARCHAR(20) NOT NULL,
    programa VARCHAR(30) NOT NULL,
    id_sede INT NOT NULL,
    
    CONSTRAINT fk_aula_sede
        FOREIGN KEY (id_sede)
        REFERENCES sede(id_sede)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
)
DEFAULT CHARSET=utf8mb4;

CREATE TABLE horario (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana ENUM('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    minutos_equivalentes INT NOT NULL,
    id_aula INT NOT NULL,
    
    CONSTRAINT fk_horario_aula
        FOREIGN KEY (id_aula)
        REFERENCES aula(id_aula)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
DEFAULT CHARSET=utf8mb4;


CREATE TABLE estudiante(
id_estudiante int PRIMARY KEY ,
nombres varchar(100),
apellidos varchar(100),
id_aula int not null,

  Constraint fk_id_aula
	Foreign KEY (id_aula)
	References aula(id_aula)
    on delete restrict
    on update cascade
)
DEFAULT CHARSET=utf8mb4;


CREATE TABLE calificaciones(
id_calificacion int AUTO_INCREMENT,
fecha date,
calificacion float,
id_estudiante int not null,

UNIQUE KEY uq_id_calificacion(id_calificacion),

PRIMARY KEY (id_estudiante,id_calificacion),
	Constraint fk_id_estudiante
	Foreign KEY (id_estudiante)
	References estudiante(id_estudiante)
    on delete cascade
    on update cascade

)
DEFAULT CHARSET=utf8mb4;

CREATE TABLE asistencia_estudiante(
id_asistencia int PRIMARY KEY AUTO_INCREMENT,
id_aula int not null,
id_estudiante int not null,
fecha date not null,

	Constraint fk_id_estudiante_a
	Foreign KEY (id_estudiante)
	References estudiante(id_estudiante)
    on delete restrict
    on update cascade,
    
	Constraint fk_id_aula_a
	Foreign KEY (id_aula)
	References aula(id_aula)
    on delete cascade
    on update cascade
)
DEFAULT CHARSET=utf8mb4;


CREATE TABLE tutor (
id_tutor INT PRIMARY KEY ,
nombres varchar(100) NOT NULL,
apellidos varchar(100) NOT NULL,
usuario varchar(50) NULL,
password_hash VARCHAR(256) NULL
)
DEFAULT CHARSET=utf8mb4;

CREATE TABLE relacion_aula_tutor (
fecha_asig date,
id_asignacion int auto_increment,
id_tutor int not null,
id_aula int not null,

UNIQUE KEY uq_id_asignacion(id_asignacion),

Primary Key (id_aula,id_asignacion,id_tutor),
	Constraint fk_id_aula_r
	Foreign KEY (id_aula)
	References aula(id_aula)
    on delete cascade
    ,
    
    Constraint fk_id_tutor_r
	Foreign KEY (id_tutor)
	References tutor(id_tutor)
    on delete restrict
)
DEFAULT CHARSET=utf8mb4;

CREATE TABLE cambio_tutor(
id_cambio int auto_increment PRIMARY KEY,
fecha date,
nota varchar(100),
id_aula int not null,
id_tutor_n int not null,
id_tutor_v int not null,

	Constraint fk_id_tutor_n
	Foreign KEY (id_tutor_n)
	References tutor(id_tutor)
    on delete restrict
    on update cascade,
    
	Constraint fk_id_tutor_v
	Foreign KEY (id_tutor_v)
	References tutor(id_tutor)
    on delete restrict
    on update cascade,
    
	Constraint fk_id_aula_c
	Foreign KEY (id_aula)
	References aula(id_aula)
    on delete cascade
    on update cascade
)
DEFAULT CHARSET=utf8mb4;

CREATE TABLE asistencia_tutor(
id_asistencia int AUTO_INCREMENT PRIMARY KEY,
id_aula int not null,
id_tutor int not null,
fecha date,
  Constraint fk_id_tutor_a
	Foreign KEY (id_tutor)
	References tutor(id_tutor)
    on delete restrict
    on update cascade,
    
	Constraint fk_id_aula_as
	Foreign KEY (id_aula)
	References aula(id_aula)
    on delete restrict
    on update cascade
)
DEFAULT CHARSET=utf8mb4;

CREATE TABLE fecha_reposicion(
id_repo int PRIMARY KEY AUTO_INCREMENT,
fecha date,
id_tutor int not null,

	Constraint fk_id_tutor_f
	Foreign KEY (id_tutor)
	References tutor(id_tutor)
    on delete restrict
    on update cascade
)

DEFAULT CHARSET=utf8mb4;

CREATE TABLE administrativo (
id_administrativo int PRIMARY KEY ,
nombres varchar(100) NOT NULL,
apellidos varchar(100) NOT NULL,
usuario varchar(50) NULL,
password_hash VARCHAR(256) null,
administrador ENUM('SI', 'NO') not null,
id_tutor int null,

   Constraint fk_id_tutor_ad
	Foreign KEY (id_tutor)
	References tutor(id_tutor)
    on delete restrict
    ON UPDATE CASCADE

)
DEFAULT CHARSET=utf8mb4;

CREATE TABLE motivo_inasistencia (
id_motivo int PRIMARY KEY AUTO_INCREMENT,
razon varchar(50)
)