import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import './styles.css'
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Logo from '../../assets/logo.svg';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

interface Items {
    id: number,
    title: string,
    image_url: string
};

interface IBGEInterfaceUf {
    sigla: string
};

interface IBGEInterfaceCity {
    nome: string
};

const CreatePoint = () => {
    const [items, setItems] = useState<Items[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [selectedUfs, setSelectedUfs] = useState<string>('0');
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
    const history = useHistory();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    })

    useEffect(() => {
        const getItems = async () => {
            const { data } = await api.get('/items');
            await setItems(data);
        }

        getItems();
    }, [])

    useEffect(() => {
        const getUfs = async () => {
            const { data } = await axios.get<IBGEInterfaceUf[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
            const ufsInitials = data.map(uf => uf.sigla);
            setUfs(ufsInitials);
        }

        getUfs();

    }, [])

    useEffect(() => {
        if (selectedUfs === '0') {
            return;
        }

        const getMunicipios = async () => {
            const { data } = await axios.get<IBGEInterfaceCity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUfs}/municipios`)
            const cities = data.map(city => city.nome);
            setCities(cities);
        }

        getMunicipios();
    }, [selectedUfs]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setSelectedPosition([
                latitude,
                longitude
            ])
        })
    }, [])

    /**tem que inforam ao changeEvent qual o elemento que estamos alterando */
    const handleSelectedUfs = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedUfs(e.target.value)
    }

    /**tem que inforam ao changeEvent qual o elemento que estamos alterando */
    const handleSelectedCities = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(e.target.value)
    }

    const handleMapClick = (e: LeafletMouseEvent) => {
        setSelectedPosition([
            e.latlng.lat,
            e.latlng.lng
        ])
    }

    const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value} = e.target;

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSelectedItems = (id: number) => {
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([...selectedItems, id]);
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUfs;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name, email, whatsapp,
            uf,city,latitude, longitude,
            items
        };

        await api.post('points', data);

        alert('Ponto de coleta criado');

        history.push('/')

    }

    return (
        <div id="page-create-point">
            <header>
                <img src={Logo} alt="Ecoleta" />

                <Link to='/'>
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor='name'>Nome da entidade</label>
                        <input
                            type='text'
                            name='name'
                            id='name'
                            onChange={handleChangeInput}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor='email'>E-mail</label>
                            <input
                                type='email'
                                name='email'
                                id='email'
                                onChange={handleChangeInput}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor='whatsapp'>Whatsapp</label>
                            <input
                                type='text'
                                name='whatsapp'
                                id='whatsapp'
                                onChange={handleChangeInput}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={15} onClick={handleMapClick} >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado</label>
                            <select
                                name="uf"
                                id="uf"
                                value={selectedUfs}
                                onChange={handleSelectedUfs}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                name="city"
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectedCities}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map((item) => (
                            <li 
                            key={item.id}
                            onClick={() => handleSelectedItems(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt='Teste' />
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type='submit'>
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
};

export default CreatePoint;