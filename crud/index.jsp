<h1>Fruits</h1>
<p>
  <a href="#add.jsp">Add</a>
</p>
<table border="1">
  <thead>
    <th>Name</th>
    <th>Action</th>
  </thead>
  <tbody>
<? fruits.forEach((fruit, index) => { ?>
    <tr>
      <td><?= fruit.name ?></td>
      <td>
        <a href="#edit.jsp?id=<?- index ?>">Edit</a>
        <a href="#remove.jsp?id=<?- index ?>">Remove</a>
      </td>
    </tr>
<? }) ?>
  </tbody>
</table>
