<title>Edit Fruit</title>
<h1>Edit Fruit</h1>
<?-
await include('form.jsp', {
  action: '#update.jsp?id=' + get.id,
  fruit: fruits[parseInt(get.id)]
})
?>
