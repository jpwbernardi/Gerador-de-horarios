# Documentation for the objects.js file

- The `fields` attribute is an array of strings containing the column names of this object that are not foreign keys.

- The `titles` attribute is an array of strings containing the labels for every field of this object that is not a foreign key.

- The `selectFields` attribute is for what fields that are not foreign keys should be used in the results suggestions of an autocomplete of this object. It is an array and must contain only valid indexes of the `fields` attribute.

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
