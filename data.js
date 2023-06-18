
const foodItems =  [
    {
      "name": "Pizza",
      "price": "$10.99",
      "image": "https://www.onmanorama.com/content/dam/mm/en/food/features/images/2021/10/17/pizza.jpg.transform/845x440/image.jpg"
    },
    {
      "name": "Burger",
      "price": "$6.99",
      "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YnVyZ2VyfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60"
    },
    {
      "name": "Salad",
      "price": "$8.99",
      "image": "https://example.com/salad.jpg"
    },
    {
      "name": "Sushi",
      "price": "$12.99",
      "image": "https://media.istockphoto.com/id/1369614844/photo/cook-pouring-olive-oil-on-the-fresh-colorful-spring-vegetable-salad-in-the-blue-bowl.webp?b=1&s=170667a&w=0&k=20&c=wgLQUGMNar-mH5jNtd74eKkIHANL7WiHulMiXAN-U_s="
    },
    {
      "name": "Ice Cream",
      "price": "$4.99",
      "image": "https://media.istockphoto.com/id/1396897706/photo/vanilla-soft-serve-ice-cream-cone.webp?b=1&s=170667a&w=0&k=20&c=S6oypYSoesaaKrndBk1POlIVhojg4WIv3Br0eplLuoA="
    },
    {
      "name": "Pasta",
      "price": "$9.99",
      "image": "https://media.istockphoto.com/id/1402719854/photo/creamy-pasta-with-mushroom-penne-pasta-with-mushrooms.webp?b=1&s=170667a&w=0&k=20&c=7pVyeNm368PSAtsMVfBUY_job00hjNC1Eptzq96P4sU="
    },
    {
      "name": "Sandwich",
      "price": "$7.99",
      "image": "https://media.istockphoto.com/id/1387158607/photo/croissant-with-scrambled-eggs-and-arugula-breakfast-table.webp?b=1&s=170667a&w=0&k=20&c=G2HoevZKbCEKIm6hAh9Mu8wj_QqViDo41OAbkmShZSw="
    },
    {
      "name": "Steak",
      "price": "$15.99",
      "image": "https://media.istockphoto.com/id/155144263/photo/big-rib-eye-steak-with-bite-cut-out.webp?b=1&s=170667a&w=0&k=20&c=BLlS9FGrFF-Gv0oSDQQIWSAlHCYM4DqVKEsRMjkraTc="
    },
    {
      "name": "Soup",
      "price": "$5.99",
      "image": "https://media.istockphoto.com/id/1404763528/photo/homemade-broccoli-soup-with-cheddar-cheese.webp?b=1&s=170667a&w=0&k=20&c=Svug7jSNVdyidCYq3bvThHtd54lIbD9ioW6tHh3MkUo="
    },
    {
      "name": "Tacos",
      "price": "$8.99",
      "image": "https://media.istockphoto.com/id/1347087219/photo/assortment-of-delicious-authentic-tacos-birria-carne-asada-adobada-cabeza-and-chicharone.webp?b=1&s=170667a&w=0&k=20&c=ea26j7XBxfyCPZynRh_8TXOCcCRzUfHJB_1e9TMxK1o="
    },
    {
      "name": "Chicken Wings",
      "price": "$11.99",
      "image": "https://media.istockphoto.com/id/168307283/photo/isolated-hot-wing.webp?b=1&s=170667a&w=0&k=20&c=HLmMN7An4OQEPjvGulvwGax_y-Zi21wONbFvRYwLsKg="
    },
  {
      "name": "Pancakes",
      "price": "$7.49",
      "image": "https://media.istockphoto.com/id/1348821333/photo/crepes.webp?b=1&s=170667a&w=0&k=20&c=lXPDM99AL-zTymq0lKPgIG5Xj7NafkeHTgQ_q1e0ZF0="
    },
    {
      "name": "French Fries",
      "price": "$3.99",
      "image": "https://media.istockphoto.com/id/155287019/photo/fries-in-a-cardboard-tray-on-a-white-background.webp?b=1&s=170667a&w=0&k=20&c=WuImmnfBj8E81q1FlcyifOHzvE22CZjttXXYPk32OfM="
    },
    {
      "name": "Burrito",
      "price": "$9.49",
      "image": "https://media.istockphoto.com/id/1317280854/photo/mexican-rice-and-chicken-burrito.webp?b=1&s=170667a&w=0&k=20&c=QmhqI6sR8HPFKbL2pyi4fHkyxCDMFtw99qrSu6CdgaI="
    },
    {
      "name": "Nachos",
      "price": "$6.99",
      "image": "https://media.istockphoto.com/id/1257616493/photo/rice-chips.webp?b=1&s=170667a&w=0&k=20&c=2nxFnpyxSVYipCwvWW9Ud7NK4fxFaQT8B2yVSazAw9g="
    },
    {
      "name": "Fish and Chips",
      "price": "$11.99",
      "image": "https://media.istockphoto.com/id/475043592/photo/fish-and-chips-fries-on-a-plate.webp?b=1&s=170667a&w=0&k=20&c=4hIgoLUfuwKJWlqNTxHd6nB0fgymPVPSi9hlZ8Q147Y="
    },
    {
      "name": "Fried Chicken",
      "price": "$8.99",
      "image": "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
    },
    {
      "name": "Sushi Rolls",
      "price": "$14.99",
      "image": "https://plus.unsplash.com/premium_photo-1668143360807-4e654dc5bae0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3VzaGklMjByb2xsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1000&q=60"
    },
    {
      "name": "Hot Dog",
      "price": "$5.49",
      "image": "https://plus.unsplash.com/premium_photo-1685103586466-86cfeb715a71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80"
    },
    {
      "name": "Mashed Potatoes",
      "price": "$4.99",
      "image": "https://plus.unsplash.com/premium_photo-1668618296987-1ecd6dae2d33?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFzaGVkJTIwcG90YXRvZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1000&q=60"
    },
  ]

module.exports = foodItems;