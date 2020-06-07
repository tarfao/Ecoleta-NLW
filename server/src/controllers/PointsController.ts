import knex from '../database/connection';
import { Request, Response } from 'express';

class PointsController {
    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;

        /**ao usar o conceito de transactio, se alguma sql der erro, os demais que 
         * foram executados irao retornar
         */
        const trx = await knex.transaction();
        
        const point = {
            image: 'https://images.unsplash.com/photo-1580913428023-02c695666d61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
        }

        const insertedIds = await trx('points').insert(point)

        const point_id = insertedIds[0];

        const pointIntems = items.map((item_id: number) => {
            return {
                item_id,
                point_id
            }
        })

        await trx('point_items').insert(pointIntems);

        await trx.commit();

        return response.json({ 
            id: point_id,
            ...point
        })
    }

    async show(req: Request, res: Response){
        const { id } = req.params;

        const point = await knex('points').where('id', id).first();

        if(!point){
            return res.status(400).json({ errors: 'Point not found'});
        }

        const items = await knex('items')
        .join('point_items', 'point_items.item_id', '=', 'items.id')
        .where('point_items.point_id', id)
        .select('items.title');

        return res.json({
            point, items
        });
    }

    async index(req: Request, res: Response){
        const { city, uf, items } = req.query;

        const parsedItems = String(items)
        .split(",")
        .map(item => Number(item.trim()));

        const points = await knex('points')
        .join('point_items', 'point_items.point_id', '=', 'points.id')
        .whereIn('point_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*')

        return res.json(points);
    }
}

export default PointsController;