CachedDB_Manager & DB_Model Modules
===================================

The CachedDB_Manager and DB_Model classes are designed to provide an efficient and convenient way to interact with the database while maintaining a cached representation of the data in memory.

.. _manager_model_pattern:
The CachedDB_Manager and DB_Model classes work together to provide an efficient and object-oriented approach to database interactions:

    - The CachedDB_Manager subclass (e.g., Players) handles the retrieval and caching of multiple records.
    - The DB_Model subclass (e.g., Player) represents individual records and provides methods for interacting with specific instances.

For example, in a typical usage scenario:

    1. The Players manager (extending CachedDB_Manager) would handle operations like fetching all players or finding a player by ID.
    2. The Player model (extending DB_Model) would represent an individual player and provide methods for getting or setting player-specific data.


Let's break down their purposes and how they are typically used.

CachedDB_Manager
----------------


The CachedDB_Manager is typically used as a base class for managers that handle specific types of game objects (e.g., Players, Cards).
These manager classes would extend CachedDB_Manager and customize it for their specific needs.

The main methods of the CachedDB_Manager class are:
    - :code:`getAll()`: Returns all objects of the type managed by the manager as a :hoverxref:`Collection <phpmodules/collection:Collection Module>`.
    - :code:`get($id)`: Returns the object with the specified ID.
    - :code:`getMany($ids)`: Returns a :hoverxref:`Collection <phpmodules/collection:Collection Module>` of objects with the specified IDs.

The CachedDB_Manager is an extension of the DB_Manager class that adds caching functionality.
Each time you call one of the methods above, the CachedDB_Manager will first check if the object is already in the cache.
You can invalidate the cache by calling the :code:`invalidate()` method when you are making changes to the database, not updated on the cache and used in the same PHP call.

**CachedDB_Manager Usage**


The typical usage of the CachedDB_Manager class is to create a subclass for each type of game object you want to manage (e.g., Players, Cards).
An example is present on the boilderplate as the :code:`Players` class.

The fundamentals of a typical manager class (a subclass of CachedDB_Manager) is as following:

.. _cachedb_manager_example:

.. code-block:: php

    class Players extends \FOO\Helpers\CachedDB_Manager
        {
        protected static $table = 'player';
        protected static $primary = 'player_id';
        protected static $datas = null;

        protected static function cast($row)
        {
            return new \FOO\Models\Player($row);
        }

        # Add specific methods for player management here

        }


As you can see, some properties are defined in the class:
    - :code:`$table`: The database table name associated with the manager.
    - :code:`$primary`: The primary key field of the table.
    - :code:`$datas`: The cached data for the manager.

The **cast($row)** method is used to convert a database row into an object of the appropriate type (e.g., Player).
This way, every time the manager retrieves data from the database, it will automatically cast the rows into objects of the appropriate type.
Under the hood, this is the method that is passed to the "cast" method of the QueryBuilder constructor (:hoverxref:`see QueryBuilder usage <qb_cast>`)

We will see in more details why :code:`return new \FOO\Models\Player($row);` is used in the section about the DB_Model class.

Managers will also implements in many case a :code:`getUiData()` method that will return an array of data that can be used to represent the object in the UI.
This method is typically usefull to construct the array that is returned by getAllDatas() or when you need to get the UI data in a notification.

.. code-block:: php

    public static function getUiData($pId)
    {
    return self::getAll()
        ->map(function ($player) use ($pId) {
        return $player->getUiData($pId);
        })
        ->toAssoc();
    }

In that :code:`getUiData($pId)` method, the manager will get all the players with the :code:`getAll()` method, which will return a Collection of Player objects (as the cast method is defined to return a Player object).
Then, it will map over the collection to get the UI data for each player using the :code:`getUiData($pId)` method of the Player object.
Finally, it will convert the collection to an associative array using the :code:`toAssoc()` method.


Other methods that the manager will typically implement:
    - :code:`setupNewGame()`: Initializes the manager with the initial game data (like all the elements of the same type, handled by the manager)
    - :code:`get()`: Returns a single object by ID (or whatever singular charactericts ;) ) .
    - :code:`getAll()`: Returns all objects managed by the manager.
    - :code:`getSpecificCondition()`: Returns objects that match a specific condition.
    - :code:`setXXX()`: Sets a specific attribute of an object or a set of objects.
    - etc.

The player manager present in the boilerplate also includes some other specific methods related to the players that can be explored :hoverxref:`here<TO BE ADDED ON API REF !>`.


DB_Model
--------

The DB_Model class is designed to represent individual database records as objects.
It provides a structured way to interact with database rows and includes features for easy data access and modification.

**Key features:**
    1. It uses an :code:`$attributes` array to **map class properties to database fields**.
    2. It provides **magic methods** (:code:`__call`) for dynamic getters and setters of attributes and static attributes.
    3. It includes methods for **JSON serialization** and UI data representation.

DB_Model is typically extended by classes that represent specific game entities (e.g., Player, Card).
These classes define their specific attributes and any additional methods needed for that entity type.

**DB_Model Usage**:

As for the managers, the typical usage of the DB_Model class is to create a subclass for each type of game entity you want to represent (e.g., Player, Card).
Of course, a single manager can be related to many different models. For example, you can have a "Monsters" manager that manages "Orcs" and "Dragons" models.

Let's take a look at a portion of the DB_Model implementation:

.. code-block:: php

    abstract class DB_Model extends \APP_DbObject implements \JsonSerializable
    {
    protected $table = null;
    protected $primary = null;
    protected $log = null;

    /**
    * This associative array will link class attributes to db fields
    */
    protected $attributes = [];

    /**
    * This array will contains class attributes that does not depends on the DB (static info),
    * they can only be accessed, not modified
    */
    protected $staticAttributes = [];

    #...
    }

As for the Manager, you will have :code:`$table` and :code:`$primary` attributes: the database table name and primary field associated with the model.
Along with that, you will have the :code:`$log` boolean flag to define if the model should log its changes (if null, it uses the global default value : true. See :hoverxref:`Log Module<phpmodules/log:Log Module>` for more details).

Two extra properties are defined in the class:
    - :code:`$attributes`: An associative array that links class attributes to database fields.
    - :code:`$staticAttributes`: An array that contains class attributes that do not depend on the DB (static info).


attributes property
~~~~~~~~~~~~~~~~~~~

The :code:`$attributes` property is an associative array that **maps class properties to database field names**.
It serves as a blueprint for how the object's properties relate to the database structure.
This mapping allows the DB_Model to automatically handle data manipulation and serialization.

Additionnaly, **typing can be added** to the mapping to ensure that the data is correctly casted when it is retrieved from the database.

The :code:`$attributes` property in DB_Model can have two formats for each entry:

Simple string format: :code:`'propertyName' => 'database_field_name'`
Array format: :code:`'propertyName' => ['database_field_name', 'type']`

**Simple string format:**

.. code-block:: php

    protected $attributes = [
        'propertyName' => 'database_field_name',
        // ... more mappings ...
    ];

When you use just a string, it maps the property name to the database field name without any automatic type casting. The value is stored and retrieved as-is from the database.

**Array format:**

.. code-block:: php

    protected $attributes = [
        'propertyName' => ['database_field_name', 'type'],
        // ... more mappings ...
    ];

When you use an array, the first element is the database field name, and the second element specifies the type for automatic casting. The supported types are typically:

    - :code:`'int'`: Cast to integer
    - :code:`'bool'`: Cast to boolean
    - :code:`'float'`: Cast to float
    - :code:`'obj'`: Typically used for JSON encoded data, automatically encoded/decoded


Let's look at how the attributes property might be defined in a Player model:

.. code-block:: php

    class Player extends \FOO\Helpers\DB_Model
    {
    private $map = null;
    protected $table = 'player';
    protected $primary = 'player_id';
    protected $attributes = [
        'id' => ['player_id', 'int'],
        'no' => ['player_no', 'int'],
        'name' => 'player_name',
        'color' => 'player_color',
        'eliminated' => 'player_eliminated',
        'score' => ['player_score', 'int'],
        'scoreAux' => ['player_score_aux', 'int'],
        'zombie' => 'player_zombie',
        'wood' => ['wood', 'int'],
        'gold' => ['gold', 'int'],
        'activated' => ['activated', 'bool']
    ];
        // ... rest of the class ...
    }

staticAttributes property
~~~~~~~~~~~~~~~~~~~~~~~~~

The :code:`$staticAttributes` property is an array that contains class attributes that do not depend on the database, but is computed or derived from other data, or simply static information about the model.
Those attributes are generally filled in the constructor or in specific methods, and are not meant to be modified as not persistent trough different calls.
Those are implemented to be accessed (but not modified) the same way as the attributes and included in serialization.

static attributes can be defined the same way as the attributes:

.. code-block:: php

    protected $staticAttributes = [
        'attributeName',
        ['typedAttributeName', 'type'],
        // ... more attributes ...
    ];


Static atttibutes are usually set in the constructor. For example:

.. code-block:: php

    class ActionCards extends \FOO\Helpers\DB_Model
    {
        protected $table = 'action_card';
        protected $primary = 'action_card_id';

        protected $attributes = [
        'id' => ['card_id', 'int'],
        'strength' => ['card_location', 'int'],
        'pId' => ['player_id', 'int']
        ];

        protected $staticAttributes = ['name', 'description', 'tooltip'];

        public function __construct($row)
        {
            parent::__construct($row); // ensure the (non-static) attributes are set
            // Set static attributes
            $this->name = clienttranslate('Cards');
            $this->description = clienttranslate('Draw cards from the **deck** OR snap.');
        }
    }


Constructor
~~~~~~~~~~~

The constructor of the DB_Model class is used to fill in the class attributes based on the database entry.

Let's have a look to it's implementation:

.. code-block:: php

    abstract class DB_Model extends \APP_DbObject implements \JsonSerializable
    {
        #...
        protected $attributes = [];
        protected $staticAttributes = [];
        /**
        * Fill in class attributes based on DB entry
        */
        public function __construct($row)
        {
            foreach ($this->attributes as $attribute => $field) {
            $fieldName = is_array($field) ? $field[0] : $field;

            $this->$attribute = $row[$fieldName] ?? null;
            if (is_array($field) && !is_null($this->$attribute)) {
                if ($field[1] == 'int') {
                $this->$attribute = (int) $this->$attribute;
                }
                if ($field[1] == 'bool') {
                $this->$attribute = (bool) $this->$attribute;
                }
                if ($field[1] == 'obj') {
                $this->$attribute = json_decode($this->$attribute, true);
                }
            }
        }
    }


It loops over the :code:`$attributes` array and sets the corresponding properties based on the database row passed as an argument.
This is where the call to :code:`return new \FOO\Models\Player($row);` in the :hoverxref:`manager's cast method<cachedb_manager_example>` is used.

As you can see, it also checks if the field is an array (meaning it has a type specified) and casts the value accordingly.

Magic Methods
~~~~~~~~~~~~~

The DB_Model provides magic methods that allow you to get and set properties using method calls that match the attribute names.

The :code:`__call` method is used to provide dynamic getters and setters for the class attributes.

In practice, this means you can access and modify the properties of a DB_Model object using the following format : :code:`$object-><operation><PropertyName>()`.
:code:`<PropertyName>` is the name of the attribute you want to access or modify starting with **capital letter**, and :code:`<operation>` can be:

    - :code:`get` to get the value of the property
    - :code:`is` to check the value of a boolean property
    - :code:`set` to set the value of the property
    - :code:`inc` to increment the value of the property

For example, if you have a :code:`Player` object with a :code:`score` attribute, you can access it like this:

.. code-block:: php

    $player = new Player($row);
    $score = $player->getScore();
    $player->incScore(); // Increment the score by 1
    $player->incScore(3); // Increment the score by 3
    $player->setScore(42);
    $player->isEliminated();

Since this magic method relies on a regular expression to parse the method name, it is important to follow the naming convention for the attributes:

    1. Capitalization:

        - The property name must start with a capital letter when used in the method name.
        - Example: For a property 'name', you must use getName() or setName(), not getname() or setname().

    2. No underscores in property names:

        - The pattern doesn't account for underscores in property names.
        - Example: For a property 'first_name', getFirst_name() won't work as expected.

    3. Camel case convention:

        - The pattern assumes camelCase for multi-word properties.
        - Example: For 'firstName', you'd use getFirstName(), not getFirstname().

**Limitations:**

The 'is' prefix is typically used for boolean properties, but the pattern doesn't enforce this, which could lead to confusing method names for non-boolean properties as it is casted on the PHP side with :code:`(bool) ($this->$name != 0)`.
The same applies for the 'inc' prefix, which is typically used for numeric properties, but not enforced.
Additionally, the pattern requires using getter and setter methods, not allowing direct property access. For example, :code:`$obj->name` won't work.


Serialization
~~~~~~~~~~~~~

The DB_Model class implements the JsonSerializable interface, which allows objects to specify how they should be serialized when converted to JSON.
This is primarily handled by the :code:`jsonSerialize()` method.

.. code-block:: php

    abstract class DB_Model extends \APP_DbObject implements \JsonSerializable
    {
        #...
        public function jsonSerialize()
        {
            $data = [];
            foreach ($this->attributes as $attribute => $field) {
                $data[$attribute] = $this->$attribute;
            }
            return $data;
        }
        #...
    }

this implementation will return an associative array with the properties of the object as keys and their values as values.

In a subclass, implementing the :code:`jsonSerialize()` method is not mandatory, but it can be useful to customize the serialization process.

For example, you might want to exclude certain properties from the JSON output (to hide secret information for example) or include additional computed properties.

.. code-block:: php

    class Monster extends \FOO\Helpers\DB_Model
    {
        #...
        public function jsonSerialize()
        {
            $data = parent::jsonSerialize();
            if ($this->getStatus() == 'hidden') {
                $data['arg'] = null; // hide the arg property
            } else {
                // add some staticAttributes
                $data['effect'] = $this->effect;
                $data['desc'] = $this->desc;
            }
            $data['family'] = $this->getType();
            $data['power'] = Monsters::getMonstersPower(); // a computed value

            return $data;
        }
    }

**getStaticData()**

In the serialization process, you might want to add all the staticAttributes to the output.
To do so, you can use the :code:`getStaticData()` method that will return an associative array with the static attributes as keys and their values as values.

**getUiData()**

DB_Model also implements a :code:`getUiData()` method that will return an associative array with all attributes and staticAttributes.

.. code-block:: php

    abstract class DB_Model extends \APP_DbObject implements \JsonSerializable
    {
        #...
        public function getUiData()
        {
            return array_merge($this->jsonSerialize(), $this->getStaticData());
        }
        #...
    }
