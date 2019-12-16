export default async function managedPackageEdit(server) {
  const providerObj = await server.create('provider', {
    name: 'Cool Provider',
    id: 'testId',
  });

  await server.create('package', {
    provider: providerObj,
    name: 'Cool Package',
    contentType: 'E-Book',
    isSelected: true,
    id: 'testId',
  });
}
