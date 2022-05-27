# tspace-mysql

[![NPM version](https://img.shields.io/npm/v/tspace-mysql.svg)](https://www.npmjs.com)
[![NPM downloads](https://img.shields.io/npm/dm/tspace-mysql.svg)](https://www.npmjs.com)

Query builder object relation mapping

## Install

Install with [npm](https://www.npmjs.com/):

```sh
npm install tspace-mysql --save

```
## Setup
create  .env file
```js
DB_HOST = localhost
DB_PORT = 3306
DB_USERNAME = root
DB_PASSWORD = password
DB_DATABASE = database
```
## Basic Usage

```js
/**
 * DB
 * 
 * @Usage DB
*/
import { DB } from 'tspace-mysql'

(async () => {
    await new DB().raw('SELECT * FROM users')
    await new DB().table('users').where('active',true).findMany()
    await new DB().table('users').whereIn('id',[1,2,3]).where('active','!=',true).findOne()
    
    const db = await new DB().table('users')
        db.name = 'name'
        db.username = 'username'

    const result =  await db.save() 
    /* 
        await db.save()
        const { result } = db
    */
    
    await new DB()
       .table('users')
        .create({
            name : 'name',
            username: 'users'
        }).save()

    await new DB()
        .table('users')
        .createMultiple([{
            name : 'name',
            username: 'users'
        },
        {
            name : 'name2',
            username: 'users2'
        },
        {
            name : 'name3',
            username: 'users3'
        }]).save()

    await new DB()
        .table('users')
        .whereUser(1)
        .update({
            name: 'users12345'
        }).save()

    await new DB().where('id',1).delete()

    await new DB()
        .table('users')
        .where('id',1)
        .updateOrCreate({
            name: 'users12345'
        }).save()

    await new DB()
        .table('users')
        .whereId(1)
        .createNotExists({
            name: 'users12345'
        }).save()

        /**
         * transaction statement
         * 
        */
       const transaction = await new DB().beginTransaction()

        try { 

            const user = await new DB()
                .table('users')
                .create({
                    name: 'users12345'
                },transaction)
                .save()

            await new DB()
                .table('posts')
                .create({
                    user_id: user.id
                },transaction).save()

            // try to error     
            throw new Error('test transaction')

        } catch (err) {
            await transaction.rollback()
        }
})()
```
## Model
support hasOne ,hasMany,belongsTo,belongsToMany

```js
/**
 * Model
 *  
 * @Usage Model
*/
import { Model } from 'tspace-mysql'
import Post from '../Post'
import SubPost from '../SubPost'
import Role from '../Role'

class User extends Model {
    constructor(){
        super()
        this.hasMany({name : 'posts', model: Post })   
        // relation child * prefix with relation parent ex phones.brand
        this.hasMany({name : 'posts.sub_post', model: SubPost ,child : true}) 
        this.belongsToMany({name : 'roles', model: Role }) 
    }
} 
export default User
(async () => {

    await new User().with('posts').withChild('phones.brand').findMany()

})()
```
## Method chaining
method chaining for query data
```js
/**
 * Method
 * 
 * @Usage Method chaining
*/
where(column , operator , value)   
whereSensitive(column , operator , value) 
whereId(id)  
whereUser(userId)  
whereEmail(value)  
orWhere(column , operator , value)   
whereIn(column , [])
whereNotIn(column , [])
whereNull(column)
whereNotNull(column)
whereBetween (column , [value1 , value2])
whereSubQuery(colmn , rawSQL)

select(column1 ,column2 ,...N)
except(column1 ,column2 ,...N)
only(column1 ,column2 ,...N)
hidden(column1 ,column2 ,...N)
join (primary key , table.foreign key) 
rightJoin (primary key , table.foreign key) 
leftJoin (primary key , table.foreign key) 
limit (limit)
orderBy (column ,'ASC' || 'DSCE')
having (condition)
latest (column)
oldest (column)
groupBy (column)
insert(objects)
create(objects)
createMultiple(array objects)
update (objects)
insertNotExists(objects)
createNotExists(objects)
updateOrInsert (objects)
updateOrCreate (objects)

/** 
 * relationship
 * 
 * @Relation setup name in model
*/
with(name1 , name2,...nameN)
withExists(name1 , name2,...nameN) 
withChild(nameParent.nameChild1 , nameParent.nameChild2, ...n)

/**
 * query statement
 * 
 *  @exec statement
*/
findMany()
findOne()
find(id)
first()
get()
all()
exists ()
onlyTrashed() // where soft delete
toSQL()
toJSON()
toString()
toArray(column)
count(column)
sum(column)
avg(column)
max(column)
min(column)
pagination({ limit , page })
save() /*for statement insert or update */
```
## Cli
npm install tspace-mysql -g
```js
/**
 * 
 * 
 * @cli 
*/ 
npm install tspace-mysql -g

- tspace-mysql make:model <FOLDER/NAME> | tspace-mysql make:model <FOLDER/NAME> --m  --f=... --name=....
    --m  /* created table for migrate in <FOLDER/migrations> */
    --f=FOLDER/... 
    /* created table for migrate in <CUSTOM FOLDER> default  <FOLDER/migrations> */ 
    --js /* extension .js default .ts */
    --name=NAME /* class name default <NAME> in <FOLDER/NAME> */

- tspace-mysql make:table <FOLDER> --name=....
    --name=TABLENAME  /* created table for migrate in <FOLDER> */
    --js /* extension .js default .ts */

- tspace-mysql migrate <FOLDER> | tspace-mysql migrate <FOLDER> --js
    --js /* extension .js default .ts */
    
tspace-mysql make:model App/Models/User --m

/*Ex folder 
- node_modules
- App
  - Models
      User.ts
*/

/* in App/Models/User.ts */
import { Model } from 'tspace-mysql'
class User extends Model{
  constructor(){
    super()
    /**
     * 
     * 
     *  @Config Model
    */
    this.useDebug()  /* default false *debug sql */
    this.useTimestamp() /* default false * case created_at & updated_at*/
    this.useSoftDelete()  /*  default false * case where deleted_at is null  */
    this.useTable('users') /*  default users   */
    this.usePattern('camelCase') /*  default snake_case  */
    this.useDefaultOrderBy('id',{ latest : true}) /*  default latest true *DESC  */
    this.useUUID()
    this.useRegistry()
  }
}
export default User

tspace-mysql make:table App/Models/migrations --name=users
/* in App/Models/migrations/create_users_table.ts */
import { Schema , Blueprint , DB } from 'tspace-mysql'
(async () => {
    await new Schema().table('users',{ 
        id :  new Blueprint().int().notNull().primary().autoIncrement(),
        name : new Blueprint().varchar(120).default('my name'),
        email : new Blueprint().varchar(255).unique(),
        email_verify : new Blueprint().tinyInt(),
        password : new Blueprint().varchar(255),
    })


    /**
     * 
     *  @Faker data
     *  await new DB().table('users').faker(5)
    */

})()
/* migrate all table in folder into database */
tspace-mysql migrate App/Models/migrations
```
