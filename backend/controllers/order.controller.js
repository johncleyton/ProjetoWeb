// ===== PEDIDO DE MARMITA =====
async function createMarmitaOrder(request, response) {
    try {
        const { misturas, feijao, acompanhamentos, carboidrato, observacoes, telefone } = request.body

        if (!misturas || !feijao || !carboidrato || !telefone) {
            return response.status(400).json({ error: "Campos obrigatórios não preenchidos." })
        }

        console.log("===== NOVO PEDIDO DE MARMITA =====")
        console.log(`Misturas: ${Array.isArray(misturas) ? misturas.join(', ') : misturas}`)
        console.log(`Feijão: ${feijao}`)
        console.log(`Acompanhamentos: ${Array.isArray(acompanhamentos) ? acompanhamentos.join(', ') : acompanhamentos || 'Nenhum'}`)
        console.log(`Batata/Massa: ${carboidrato}`)
        console.log(`Observações: ${observacoes || 'Nenhuma'}`)
        console.log(`Telefone: ${telefone}`)
        console.log(`Data: ${new Date().toLocaleString('pt-BR')}`)
        console.log("==================================")

        return response.status(201).json({
            message: "Pedido de marmita recebido com sucesso!",
            pedido: { misturas, feijao, acompanhamentos, carboidrato, observacoes, telefone }
        })
    } catch (error) {
        console.error("Erro ao processar pedido de marmita:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

// ===== PEDIDO DE VINHOS =====
async function createWineOrder(request, response) {
    try {
        const { items, nome, telefone, entrega, mesa } = request.body

        if (!items || items.length === 0) return response.status(400).json({ error: "Carrinho está vazio." })
        if (!nome || !telefone) return response.status(400).json({ error: "Nome e telefone são obrigatórios." })

        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0)

        console.log("===== NOVO PEDIDO DE VINHOS =====")
        console.log(`Cliente: ${nome} | Telefone: ${telefone} | Entrega: ${entrega}`)
        if (mesa) console.log(`Mesa: ${mesa}`)
        items.forEach(item => console.log(`  - ${item.name} × ${item.qty} = R$ ${(item.price * item.qty).toFixed(2)}`))
        console.log(`Total: R$ ${total.toFixed(2)} | Data: ${new Date().toLocaleString('pt-BR')}`)
        console.log("=================================")

        const orderNumber = '#' + Math.floor(1000 + Math.random() * 9000)
        return response.status(201).json({ message: "Pedido confirmado!", orderNumber, total })
    } catch (error) {
        console.error("Erro ao processar pedido de vinhos:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

export default { createMarmitaOrder, createWineOrder }
