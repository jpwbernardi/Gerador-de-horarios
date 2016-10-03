# Documentation for the objects.js file

- The `fields` attribute is an array of strings containing the column names of this object that are not foreign keys.

- The `titles` attribute is an array of strings containing the labels for every field of this object that is not a foreign key.

- The `selectFields` attribute is for what fields that are not foreign keys should be used in the results suggestions of an autocomplete of this object. It is an array and must contain only valid indexes of the `fields` attribute.

- The `selectWhere` attribute indicates, for each primary key that is a also a foreign key (see annotations below), what foreign field the `i`th field depends on. That field will be used in the `where` statement inside the dynamic `select` that will be created.
  Every position of this array is a JSON with `object` and `field` keys. The values are: for the `object` key, an array of objects; for the `field` key, an array of valid indexes for the `fields` attribute of the objects previously listed in this JSON. For every foreign field that this field depends on, a new position in `object` *and* `field` is needed, indicating where it comes from and what foreign field it is. E.g.:

  ```
  DowShiftTime.selectWhere = [undefined, {
    "object": [DayOfWeek],
    "field": DayOfWeek.primaryKey // this is an array!
  }, {
    "object": [Shift],
    "field": Shift.primaryKey // this is an array!
  }];
  ```

  In the `DowShiftTime` object, the first field does not depend on anyone, so it is `undefined`. This is important: if the field does not depend on anyone, leave that position as `undefined`. **Otherwise, it will throw an error. These two arrays must be non-empty and the same length, if they exist**. The second field (that comes from `Shift`, if you look at the object) depends on the primary key**s** of `DayOfWeek` (this is because the shift might vary depending on the day of the week). Likewise, the third field (which comes from `Time`) depends on `Shift` (night shift does not have the 5th time block, for example). Note that this dependence *forbids* the user to select shift before day of week, and time before shift.

- The `foreignTitle` attribute is the label of the autocomplete input field of this object. Must be a valid index of the `titles` attribute.

- To make a field required, add a static attribute to the Object function called `fieldRequired` with a boolean for every field in the class. E.g.:
  ```
  ProfessorRestriction.fieldRequired = [true, true, true];
  ```
  The `ProfessorRestriction` class has only three booleans because its class has only three attributes, even though it ends up having 5 fields in the GUI. A required field in an object does not interfere with the exact same field being required in a class that references it.

# Annotations for the generated HTML code based on these objects

- **Currently, autocomplete only supports natural join**. This means that if the foreign key has a different name than the primary key in the foreign table, it will not work properly. Also take care of tables sharing column names.
- An autocomplete field is created for every primary key of every foreign object that is also a foreign key. On the last level (an object with primary keys that are not also foreign keys), only one autocomplete field is created, and as many hidden fields as there are primary keys.
- When the field is a foreign key, the `object` attribute on the visible field indicates the first level foreign object, i.e., where it should be `SELECT`ed from. On foreign keys hidden fields and on fields that are not foreign keys, it's used to select the fields that are going to be persisted.
- When the field is a foreign key, the `owner-object` attribute indicates who is the actual owner of that field, where it comes from. That's why the field 'Dia da semana' has `owner-object='DayOfWeek'`. Otherwise, it's the same as the `object` attribute.
- To create a form for a class, simply add a line in the following pattern to the desired HTML:

  ```
  <div class="form" object="Object"></div>
  ```

  Where "Object" must be replaced with the class name of the object. E.g.: Professor for the `Professor` class and so on.
- To create a list of the persisted objects of a class, the steps are indentical, just change the `.form` class to `.list`:

  ```
  <div class="list" object="Object"></div>
  ```
