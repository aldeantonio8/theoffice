# Avatares humanos — The Office

## Estado atual

O personagem principal e os sete NPCs usam modelos humanos GLB de demonstração, carregados por URL, em vez dos bonecos de cápsulas. Os modelos são provisórios: **não representam a identidade visual final da empresa**.

- Feminino: `avatar_1_f.glb` do projeto RAVAS.
- Masculino: `avatar_2_m.glb` do projeto RAVAS.
- Origem: https://github.com/carlosfranzreb/ravas/tree/main/rpm/public
- O código do repositório de origem está sob MIT, mas isso **não comprova, por si só, os direitos de redistribuição e uso comercial dos avatares**. Antes da publicação comercial, substituir por modelos com licença de assets verificada ou por avatares de autoria própria.
- Por enquanto, **não incorporamos ficheiros binários de terceiros neste repositório**.
- Em caso de erro de carregamento, surge uma personagem geométrica de reserva.

## Utilizar os seus próprios modelos

Guarde os modelos autorizados em:

```text
public/models/characters/personagem.glb
public/models/characters/rececionista.glb
```

Crie `.env.local`:

```env
NEXT_PUBLIC_AVATAR_MASCULINO_URL=/models/characters/personagem.glb
NEXT_PUBLIC_AVATAR_FEMININO_URL=/models/characters/rececionista.glb
```

Ambos os ficheiros devem incluir **corpo inteiro**, ter pose inicial neutra e, idealmente, clips de animação chamados `Idle`, `Walk` e `Talk` (os nomes são reconhecidos de forma aproximada). Modelos sem clips recebem apenas movimento corporal subtil como reserva.

A altura é ajustada automaticamente para cerca de 1,75 unidades, mas materiais, calçado, orientação e qualidade das texturas devem ser verificados visualmente. O avatar atual é semi-realista, não fotorealista.

## Direção artística recomendada

Personagens negros/africanos, proporções naturais, variedade de tons de pele, vestuário profissional contemporâneo e expressões subtis. Uniformizar o estilo entre todos os NPCs, sem usar o mesmo modelo para toda a equipa.

## Limitações atuais

- Os avatares dependem de downloads externos enquanto não forem substituídos por assets locais.
- O modo de fala ainda não tem sincronização labial.
- Os modelos de origem podem não conter animações.
- É necessário testar em computador e telemóvel, assim como confirmar os direitos dos ativos finais.
