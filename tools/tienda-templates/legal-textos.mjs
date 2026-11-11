// Textos legales de la tienda (BORRADOR 05-nov-2026, pendiente de revisión por la gestoría).
// Fuente: /root/monaco-tienda/investigacion/LEGAL.md (TRLGDCU, LSSI, Ley 2/2012 de Galicia) y datos del titular dados por el usuario.

export const TITULAR = {
  nombre: 'Felipe Alejandro Denti Monaco',
  comercial: 'Mónaco Barbershop',
  nie: 'Z2197058B',
  fiscal: 'Rúa Regueiro 11, 6.º C, 36211 Vigo (Pontevedra)',
  local: 'Rúa de Venezuela 71, 36204 Vigo (Pontevedra)',
  email: 'contacto@monacobarberia.com',
  tel: '+34 698 14 06 41',
};

const T = TITULAR;

export const AVISO_LEGAL_HTML = `
  <h2>Titular de la web</h2>
  <ul>
    <li><strong>Titular:</strong> ${T.nombre} (nombre comercial: ${T.comercial}).</li>
    <li><strong>NIF/NIE:</strong> ${T.nie}.</li>
    <li><strong>Dirección (establecimiento):</strong> ${T.local}.</li>
    <li><strong>Email:</strong> <a href="mailto:${T.email}">${T.email}</a>.</li>
    <li><strong>Teléfono:</strong> <a href="tel:${T.tel.replace(/\s/g, '')}">${T.tel}</a>.</li>
  </ul>
  <p>Profesional autónomo; no inscrito en el Registro Mercantil.</p>

  <h2>Actividad</h2>
  <p>Barbería y venta online de productos de peluquería y cuidado de la barba. Los precios incluyen el IVA. Los gastos de envío los tienes en <a href="/tienda/envios-devoluciones">Envíos y devoluciones</a>.</p>

  <h2>Uso de la web</h2>
  <p>Los textos, las fotos, los logotipos y el diseño de esta web son de Mónaco Barbershop o se usan con permiso. No se pueden copiar con fines comerciales sin nuestra autorización. No respondemos del contenido de las webs externas a las que enlazamos.</p>

  <h2>Ley aplicable</h2>
  <p>Esta web se rige por la ley española. En las compras, los consumidores pueden reclamar ante los juzgados de su domicilio.</p>

  <h2>Más información</h2>
  <p>Consulta las <a href="/tienda/condiciones">condiciones de compra</a> y la <a href="/privacy">política de privacidad</a>.</p>
`;

export const DEVOLUCIONES_HTML = `
  <h2>Devoluciones</h2>
  <h3>Si cambias de opinión</h3>
  <p>Tienes <strong>14 días naturales</strong> desde que recibes o recoges el pedido para devolverlo sin dar ningún motivo.</p>
  <ul>
    <li>Escríbenos a <a href="mailto:${T.email}">${T.email}</a> con tu nombre, el número de pedido y qué productos quieres devolver. También puedes hacerlo online: <a href="/tienda/desistir">Desistir del contrato aquí</a>. Además tienes el formulario de desistimiento en las <a href="/tienda/condiciones#desistimiento">condiciones de compra</a>.</li>
    <li>Después tienes otros 14 días para hacernos llegar el producto: por correo, o en la barbería, en ${T.local}, de lunes a sábado de 9:00 a 20:00.</li>
    <li>Si lo envías por correo, el coste de la devolución lo pagas tú.</li>
    <li>Te devolvemos todo lo que pagaste, incluido el envío inicial, en un máximo de 14 días desde que nos avisas, con el mismo medio de pago. Podemos esperar a recibir el producto, o la prueba de que lo has enviado, antes de hacer el reembolso.</li>
  </ul>
  <h3>Productos precintados</h3>
  <p>Por higiene y salud, los cosméticos que vienen precintados <strong>no se pueden devolver si se ha abierto el precinto</strong> después de la entrega. Si el producto sigue precintado, puedes devolverlo sin problema.</p>
  <p>En los packs, si abres un producto, puedes devolver el resto de productos que sigan precintados y te reembolsamos su parte.</p>
  <h3>Si el producto llega mal</h3>
  <p>Si te llega roto, en mal estado, caducado o no es lo que pediste, escríbenos con una foto. Te lo cambiamos o te devolvemos el dinero, y los gastos corren de nuestra cuenta. Esto no tiene nada que ver con el plazo de 14 días: lo cubre la garantía legal de 3 años.</p>
`;

export const CONDICIONES_HTML = `
  <p class="legal-note">Última actualización: 5 de noviembre de 2026.</p>

  <h2>1. Quién vende</h2>
  <p>La tienda online de ${T.comercial} es de <strong>${T.nombre}</strong>, autónomo, con NIE ${T.nie} y establecimiento en ${T.local}.</p>
  <ul>
    <li>Barbería y punto de recogida: ${T.local}.</li>
    <li>Email: <a href="mailto:${T.email}">${T.email}</a></li>
    <li>Teléfono: <a href="tel:${T.tel.replace(/\s/g, '')}">${T.tel}</a></li>
  </ul>

  <h2>2. Cómo se compra</h2>
  <ol>
    <li>Añades los productos al carrito. En los packs con elección, eliges antes la cera y el champú.</li>
    <li>En el carrito eliges cómo recibirlo (envío a península, a Baleares o recogida en la barbería) y ves el precio total con el envío.</li>
    <li>Pulsas el botón de pago y terminas en la pasarela segura de Stripe, donde pones tus datos y pagas.</li>
    <li>Al pagar, recibes un email de confirmación con el resumen del pedido.</li>
  </ol>
  <p>Antes de pagar puedes revisar y corregir el carrito: cambiar cantidades, quitar productos o cambiar la forma de entrega. El contrato se hace en castellano. Guardamos el pedido y te mandamos una copia por email.</p>

  <h2>3. Precios y pago</h2>
  <ul>
    <li>Los precios están en euros e incluyen el IVA.</li>
    <li>Los gastos de envío se suman aparte y los ves antes de pagar: península 4,95 € (gratis desde 45 €), Baleares 6,95 €, recogida en la barbería gratis.</li>
    <li>Se paga con tarjeta de débito o crédito, o con los otros métodos que aparezcan en la pantalla de pago de Stripe. No guardamos los datos de tu tarjeta.</li>
  </ul>

  <h2>4. Envío y entrega</h2>
  <ul>
    <li>Preparamos el pedido en 24-48 h laborables.</li>
    <li>Península: entrega con Correos en 2-4 días laborables. Baleares: 3-5 días laborables.</li>
    <li>No enviamos a Canarias, Ceuta ni Melilla.</li>
    <li>La espuma de rizos y el Pack Rizos son aerosoles y solo se pueden recoger en la barbería.</li>
    <li>Recogida en la barbería: te avisamos por email, WhatsApp o teléfono cuando esté listo y te lo guardamos 15 días.</li>
    <li>En cualquier caso, la entrega se hará como máximo en 30 días naturales desde la compra.</li>
  </ul>

  <h2 id="desistimiento">5. Derecho de desistimiento (devoluciones)</h2>
  <p>Tienes <strong>14 días naturales</strong> para desistir de la compra sin dar ningún motivo. El plazo empieza el día en que tú, o la persona que indiques, recibe el pedido, o el día en que lo recoges en la barbería. Si el pedido llega en varias partes, cuenta desde la última.</p>
  <ul>
    <li><strong>Cómo:</strong> escríbenos a <a href="mailto:${T.email}">${T.email}</a> antes de que acabe el plazo, usa la función online <a href="/tienda/desistir">Desistir del contrato aquí</a> o el formulario de abajo. Basta con enviarlo dentro de plazo.</li>
    <li><strong>Devolución del producto:</strong> tienes 14 días naturales desde que nos avisas para enviarlo o traerlo a la barbería. Si lo envías, el coste de la devolución lo pagas tú.</li>
    <li><strong>Reembolso:</strong> te devolvemos todo lo pagado, incluido el envío inicial (el de la opción más barata), en un máximo de 14 días naturales desde que nos avisas y con el mismo medio de pago. Podemos esperar a recibir el producto, o la prueba de que lo has enviado.</li>
    <li><strong>Excepción por higiene:</strong> no hay derecho de desistimiento en los productos precintados que no se pueden devolver por razones de salud o higiene y que se han desprecintado después de la entrega. Los cosméticos precintados que sigan cerrados sí se pueden devolver.</li>
    <li><strong>Packs:</strong> si abres un producto de un pack, puedes devolver los que sigan precintados y te reembolsamos su parte.</li>
    <li>Respondes de la pérdida de valor del producto si lo has manipulado más de lo necesario para ver cómo es.</li>
  </ul>

  <h3>Formulario de desistimiento</h3>
  <p>Solo tienes que rellenarlo y enviarlo si quieres desistir del contrato. Puedes copiar este texto en un email.</p>
  <blockquote class="legal-form">
    <p>A la atención de ${T.nombre} (${T.comercial}), ${T.local}, ${T.email}:</p>
    <p>Por la presente le comunico que desisto de mi contrato de venta del siguiente bien: ____</p>
    <p>Pedido el / recibido el: ____</p>
    <p>Nombre del consumidor: ____</p>
    <p>Domicilio del consumidor: ____</p>
    <p>Firma del consumidor (solo si se presenta en papel): ____</p>
    <p>Fecha: ____</p>
  </blockquote>

  <h2>6. Garantía</h2>
  <p>Todos los productos tienen la <strong>garantía legal de 3 años</strong> desde la entrega por falta de conformidad: si llegan rotos, defectuosos, caducados o no son lo que pediste. En ese caso te lo cambiamos o te devolvemos el dinero, y los gastos de envío corren de nuestra cuenta. Guarda el email de confirmación, que sirve como justificante.</p>
  <p>No es falta de conformidad el desgaste por el uso normal ni el daño por guardar el producto en malas condiciones o usarlo después de su fecha de caducidad.</p>

  <h2>7. Atención al cliente y reclamaciones</h2>
  <ul>
    <li>Para cualquier duda o queja: <a href="mailto:${T.email}">${T.email}</a> o <a href="tel:${T.tel.replace(/\s/g, '')}">${T.tel}</a>.</li>
    <li>Cuando nos escribas una reclamación, te daremos un número de incidencia y te responderemos por escrito en un plazo máximo de un mes.</li>
    <li>Tienes hojas de reclamaciones a tu disposición en la barbería, en ${T.local}.</li>
    <li>También puedes reclamar online ante la Xunta de Galicia: <a href="https://sede.xunta.gal/detalle-procedemento?codtram=CO401A" target="_blank" rel="noopener">formulario de reclamación en materia de consumo</a>.</li>
    <li>No estamos adheridos a ningún sistema de arbitraje ni de resolución alternativa de litigios.</li>
  </ul>

  <h2>8. Ley aplicable</h2>
  <p>Estas condiciones se rigen por la ley española, en especial la Ley General para la Defensa de los Consumidores y Usuarios y la Ley de Servicios de la Sociedad de la Información. Si eres consumidor, puedes reclamar ante los juzgados de tu domicilio.</p>
`;
