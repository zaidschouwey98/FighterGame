import { EntityInfo } from "../messages/EntityInfo";

export class CollisionService {
    private static doesOverlapWithEntity(entity1: EntityInfo, entity2: EntityInfo): boolean {
        const dx = entity1.position.x - entity2.position.x;
        const dy = entity1.position.y - entity2.position.y;
        const distanceSquared = dx * dx + dy * dy;
        const radiusSum = entity1.radius + entity2.radius;

        return distanceSquared <= radiusSum * radiusSum;
    }

    public static overlappedEntities(source:EntityInfo, entities:EntityInfo[]): EntityInfo[]{
        const overlappedEntites: EntityInfo[] = []
        for(const entity of entities){
            if(entity.id == source.id)
                continue;
            if(this.doesOverlapWithEntity(source,entity))
                overlappedEntites.push(entity);
        }
        return overlappedEntites;
    }   
}